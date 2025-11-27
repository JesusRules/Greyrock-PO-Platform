import { Request, Response } from "express";
import PurchaseOrder from "../models/PO.js";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Department from "../models/Department.js";
import { createNoCacheHeaders } from "../utils/noCacheResponse.js";
import { v2 as cloudinary } from "cloudinary";
import React from 'react';
import { PurchaseOrder as POType } from "../../types/PurchaseOrder.js";
import { PO_PDF } from '../pdf/PO_PDF.js'
import { PO_PDF3 } from "../pdf/PO_PDF3.js";
import { Resend } from "resend";
import { EmailTemplateNewPORequiresSignature } from "../emails/EmailTemplateNewPORequiresSignature.js";
import { sendApproverSignatureEmails, sendSubmitterNeedsToSignEmail, sendSubmitterRoleSignedEmail } from "../utils/poEmailService.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// GET all
export const getAllPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const orders = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'department', model: Department })
      // .populate({ path: 'vendor', model: Vendor })
      // .populate({ path: 'submitter', model: User })
      // .populate({ path: 'signedBy', model: User });
      // Signatures: populate the user in each role
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    res
    .status(200)
    .set(createNoCacheHeaders())
    .json({ purchaseOrders: orders });
  } catch (err) {
    console.error('Fetching purchase orders error:', err)
    res
    .status(500)
    .set(createNoCacheHeaders())
    .json({ message: "Failed to fetch purchase orders" });
  }
};

// controllers/POController.ts

// controllers/POController.ts
export const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await PurchaseOrder.findById(id)
      .populate({ path: "department", model: Department })
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    if (!order) {
      res
        .status(404)
        .set(createNoCacheHeaders())
        .json({ message: "Purchase order not found" });
      return;
    }

    res
      .status(200)
      .set(createNoCacheHeaders())
      .json({ purchaseOrder: order }); // 👈 singular
      return;
  } catch (err) {
    console.error("Fetching purchase order by id error:", err);
    res
      .status(500)
      .set(createNoCacheHeaders())
      .json({ message: "Failed to fetch purchase order" });
    return;
  }
};

// POST create
export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser?._id) {
      res
        .status(401)
        .set(createNoCacheHeaders())
        .json({ message: "Not authenticated." });
      return;
    }

    const creator = await User.findById(authUser._id);
    if (!creator) {
      res
        .status(404)
        .set(createNoCacheHeaders())
        .json({ message: "Creator user not found." });
      return;
    }

    // Extract the submitter id from the incoming body
    const body = { ...req.body };
    const submitterSig = body.signatures?.submitter || {};
    const submitterIdRaw = submitterSig.signedBy || body.submitter; // fallback if you ever pass a separate submitter field

    // If no submitter was provided, just create as-is (no emails)
    if (!submitterIdRaw) {
      const newOrder = new PurchaseOrder(body);
      const savedOrder = await newOrder.save();

      const populatedOrder = await PurchaseOrder.findById(savedOrder._id)
        .populate({ path: "department", model: Department })
        .populate({ path: "signatures.submitter.signedBy", model: User })
        .populate({ path: "signatures.manager.signedBy", model: User })
        .populate({ path: "signatures.generalManager.signedBy", model: User })
        .populate({ path: "signatures.financeDepartment.signedBy", model: User });

      res
        .status(201)
        .set(createNoCacheHeaders())
        .json({ purchaseOrder: populatedOrder });
      return;
    }

    const submitterId = submitterIdRaw.toString();
    const creatorId = creator._id.toString();

    // Load the *actual* submitter user
    const submitterUser = await User.findById(submitterId);
    if (!submitterUser) {
      res
        .status(400)
        .set(createNoCacheHeaders())
        .json({ message: "Submitter user not found." });
      return;
    }

    // Is the creator the same person as the submitter?
    const creatorIsSubmitter = creatorId === submitterId;
    const creatorIsSubmitterRole = creator.signatureRole === "submitter";

    // We’ll overwrite the submitter signature in the body according to rules
    body.signatures = body.signatures || {};
    body.signatures.submitter = body.signatures.submitter || {};

    // ------------- RULES -------------
    // 1) If the submitter is the creator AND they are a submitter-role user:
    //    - If they have signedImg -> auto-sign + email approvers.
    //    - Else -> no signedImg; email them to log in and sign.
    //
    // 2) If the creator is NOT the submitter
    //    (e.g. admin or powerUser setting someone else):
    //    -> do NOT auto-sign, just email submitter to log in and sign.

    let shouldEmailApprovers = false;
    let shouldEmailSubmitterToSign = false;

    if (creatorIsSubmitter && creatorIsSubmitterRole) {
      if (creator.signedImg) {
        // Creator is the submitter and already has a signature on file
        body.signatures.submitter = {
          signedImg: creator.signedImg,
          signedBy: creator._id,
          signedAt: new Date(),
        };
        shouldEmailApprovers = true;
      } else {
        // Creator is submitter but has no signature yet → must log in and sign later
        body.signatures.submitter = {
          signedImg: null,
          signedBy: creator._id,
          signedAt: null,
        };
        shouldEmailSubmitterToSign = true;
      }
    } else {
      // Creator is not the submitter (admin/powerUser/etc.)
      // -> NEVER auto-sign the submitter. They must log in and sign themselves.
      body.signatures.submitter = {
        signedImg: null,
        signedBy: submitterUser._id,
        signedAt: null,
      };
      shouldEmailSubmitterToSign = true;
    }

    const newOrder = new PurchaseOrder(body);
    const savedOrder = await newOrder.save();

    const populatedOrder = await PurchaseOrder.findById(savedOrder._id)
      .populate({ path: "department", model: Department })
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    // 🔹 Send emails according to what actually happened
    if (populatedOrder) {
      if (shouldEmailApprovers) {
        await sendApproverSignatureEmails(populatedOrder);
      } else if (shouldEmailSubmitterToSign) {
        await sendSubmitterNeedsToSignEmail(populatedOrder);
      }
    }

    res
      .status(201)
      .set(createNoCacheHeaders())
      .json({ purchaseOrder: populatedOrder });
    return;
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .set(createNoCacheHeaders())
      .json({ message: "Failed to create purchase order", error: err });
    return;
  }
};
// export const createPurchaseOrder = async (req: Request, res: Response) => {
//   try {
//     const newOrder = new PurchaseOrder(req.body);
//     const savedOrder = await newOrder.save();

//     const populatedOrder = await PurchaseOrder.findById(savedOrder._id)
//       .populate({ path: 'department', model: Department })
//       // .populate({ path: 'vendor', model: Vendor })
//       // .populate({ path: 'submitter', model: User })
//       // .populate({ path: 'signedBy', model: User });
//       // Signatures: populate the user in each role
//       .populate({ path: "signatures.submitter.signedBy", model: User })
//       .populate({ path: "signatures.manager.signedBy", model: User })
//       .populate({ path: "signatures.generalManager.signedBy", model: User })
//       .populate({ path: "signatures.financeDepartment.signedBy", model: User });

//     res
//     .status(201)
//     .set(createNoCacheHeaders())
//     .json({ purchaseOrder: populatedOrder });
//   } catch (err) {
//     console.error(err);
//     res
//     .status(400)
//     .set(createNoCacheHeaders())
//     .json({ message: "Failed to create purchase order", error: err });
//   }
// };

// PUT update
export const updatePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const updated = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate({ path: 'department', model: Department })
      // .populate({ path: 'vendor', model: Vendor })
      // .populate({ path: 'submitter', model: User })
      // .populate({ path: 'signedBy', model: User });
      // Signatures: populate the user in each role
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    if (!updated) {
      res
      .set(createNoCacheHeaders())
      .status(404).json({ message: "Purchase order not found" });
      return;
    }

    res
    .set(createNoCacheHeaders())
    .status(200).json({ purchaseOrder: updated });
  } catch (err) {
    res
    .set(createNoCacheHeaders())
    .status(400).json({ message: "Failed to update purchase order", error: err });
  }
};

// DELETE
export const deletePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const deleted = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Purchase order not found" });
      return;
    }
    res
    .set(createNoCacheHeaders())
    .status(204)
    .send();
  } catch (err) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to delete purchase order", error: err });
  }
};

// PATCH toggle status
export const togglePurchaseOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "Purchase order not found" });
      return;
    }

    let nextStatus: "Pending" | "Signed" | "Rejected" | "Approved";

    if (order.status === "Approved") {
      // ✅ manager/admin wants to reject an already-approved PO
      nextStatus = "Rejected";
    } else if (order.status === "Rejected") {
      // ✅ manager/admin restores it to Approved
      nextStatus = "Approved";
    } else {
      // For Pending or legacy Signed, just keep it Pending
      nextStatus = "Pending";
    }

    order.status = nextStatus;
    await order.save();

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate({ path: "department", model: Department })
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    res
      .set(createNoCacheHeaders())
      .json({ purchaseOrder: populatedOrder });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .set(createNoCacheHeaders())
      .json({ message: "Failed to toggle status", error: err });
  }
};

// controllers/purchaseOrderController.ts
export const signPurchaseOrderRoleController = async (req: Request, res: Response) => {
  try {
    const { role, revert } = req.body;
    const poId = req.params.id;
    const userId = (req as any).user?._id; // from auth middleware

    const allowedRoles = [
      "submitter",
      "manager",
      "generalManager",
      "financeDepartment",
    ];

    if (!allowedRoles.includes(role)) {
      res
        .status(400)
        .set(createNoCacheHeaders())
        .json({ message: "Invalid signature role." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res
        .status(400)
        .set(createNoCacheHeaders())
        .json({ message: "User not found." });
      return;
    }

    const po = await PurchaseOrder.findById(poId)
      .populate({ path: "department", model: Department })
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    if (!po) {
      res
        .status(404)
        .set(createNoCacheHeaders())
        .json({ message: "Purchase Order not found." });
      return;
    }

    // Helper references
    const sig: any = po.signatures?.[role] || {};
    const isAdmin = user.permissionRole === "admin";
    const isOverrideSigner = user.signatureRole === "overrideSigner";

    // ---------------- REVERT FLOW ----------------
    if (revert) {
      if (!sig.signedImg) {
        res
          .status(400)
          .set(createNoCacheHeaders())
          .json({ message: "No signature to revert for this role." });
        return;
      }

      const signedBy = sig.signedBy;
      const signedById =
        typeof signedBy === "object" ? signedBy._id?.toString() : signedBy?.toString();
      const isSignedByCurrentUser =
        !!signedById && signedById === user._id.toString();

      // For submitter, only admin or overrideSigner can revert
      if (role === "submitter" && !isAdmin && !isOverrideSigner) {
        res
          .status(403)
          .set(createNoCacheHeaders())
          .json({
            message:
              "The submitter signature can only be reverted by an admin or override signer.",
          });
        return;
      }

      // Other roles: signer themselves, admin, or overrideSigner
      if (!isSignedByCurrentUser && !isAdmin && !isOverrideSigner) {
        res
          .status(403)
          .set(createNoCacheHeaders())
          .json({ message: "You are not authorized to revert this signature." });
        return;
      }

      sig.signedImg = null;
      sig.signedBy = null;
      sig.signedAt = null;

      po.signatures[role] = sig;

      // po.status = "Pending";
      // ✅ if GM’s signature is reverted, go back to Pending
      if (role === "generalManager") {
        po.status = "Pending";
      }

      await po.save();

      // re-populate on the same doc instance
      await po.populate([
        { path: "department", model: Department },
        { path: "signatures.submitter.signedBy", model: User },
        { path: "signatures.manager.signedBy", model: User },
        { path: "signatures.generalManager.signedBy", model: User },
        { path: "signatures.financeDepartment.signedBy", model: User },
      ]);

      res
        .status(200)
        .set(createNoCacheHeaders())
        .json({ purchaseOrder: po });
      return;
    }

    // ---------------- SIGN FLOW ----------------
    if (!user.signedImg) {
      res
        .status(400)
        .set(createNoCacheHeaders())
        .json({ message: "User has no saved signature on file." });
      return;
    }

    // who can sign?
    const isDirectRole = user.signatureRole === role;
    if (!isDirectRole && !isOverrideSigner) {
      res
        .status(403)
        .set(createNoCacheHeaders())
        .json({ message: "You are not authorized to sign for this role." });
      return;
    }

    const wasSubmitterSigned = !!po.signatures?.submitter?.signedImg;
    const wasThisRoleSigned = !!sig.signedImg;

    // Additional safety: for submitter, ensure they are actually the recorded submitter
    if (role === "submitter") {
      const submitterSig = po.signatures.submitter;
      const sb = submitterSig?.signedBy;
      const sbId = typeof sb === "object" ? sb._id?.toString() : sb?.toString();

      const isOriginalSubmitter =
        !!sbId && sbId === user._id.toString();

      if (!isOriginalSubmitter && !isOverrideSigner) {
        res
          .status(403)
          .set(createNoCacheHeaders())
          .json({
            message:
              "Only the original submitter or an override signer can sign as submitter.",
          });
        return;
      }
    }

    // Apply signature
    sig.signedImg = user.signedImg;
    sig.signedBy = user._id;
    sig.signedAt = new Date();
    po.signatures[role] = sig;

    // You currently set status to "Signed" on any signature;
    // keep this for now, or adjust to "Partially Signed" if you want.
    // po.status = "Signed";
    if (role === "generalManager") {
      po.status = "Approved";
    }

    await po.save();
    
    // re-populate on the same doc instance
    await po.populate([
      { path: "department", model: Department },
      { path: "signatures.submitter.signedBy", model: User },
      { path: "signatures.manager.signedBy", model: User },
      { path: "signatures.generalManager.signedBy", model: User },
      { path: "signatures.financeDepartment.signedBy", model: User },
    ]);

    // 🔹 After save, check transitions & send emails:

    // 1) If submitter just transitioned from unsigned -> signed, notify approvers
    const isSubmitterNowSigned = !!po.signatures?.submitter?.signedImg;
    if (role === "submitter" && !wasSubmitterSigned && isSubmitterNowSigned) {
      await sendApproverSignatureEmails(po);
    }

    // 2) If an approver just signed, notify submitter
    const APPROVER_ROLES = [
      "manager",
      "generalManager",
      "financeDepartment",
    ];

    if (
      APPROVER_ROLES.includes(role) &&
      !wasThisRoleSigned &&
      !!sig.signedImg
    ) {
      await sendSubmitterRoleSignedEmail({
        purchaseOrder: po,
        approverUser: user,
        role: role,
      });
    }

    res
      .status(200)
      .set(createNoCacheHeaders())
      .json({ purchaseOrder: po });
    return;
  } catch (err: any) {
    console.error("signPurchaseOrderRole error:", err);
    res
      .status(400)
      .set(createNoCacheHeaders())
      .json({ message: err.message || "Failed to sign purchase order." });
    return;
  }
};

// export const signPurchaseOrderRoleController = async (req: Request, res: Response) => {
//   try {
//     const { role, revert } = req.body;
//     const poId = req.params.id;
//     const userId = (req as any).user?._id; // from auth middleware

//     const allowedRoles = ["submitter", "manager", "generalManager", "financeDepartment"];

//     if (!allowedRoles.includes(role)) {
//       res
//         .set(createNoCacheHeaders())
//         .status(400)
//         .json({ message: "Invalid signature role." });
//       return;
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       res
//         .set(createNoCacheHeaders())
//         .status(400)
//         .json({ message: "User not found." });
//       return;
//     }

//     // 🔁 REVERT FLOW
//     if (revert) {
//       const po = await PurchaseOrder.findById(poId)
//         .populate({ path: "department", model: Department })
//         .populate({ path: "signatures.submitter.signedBy", model: User })
//         .populate({ path: "signatures.manager.signedBy", model: User })
//         .populate({ path: "signatures.generalManager.signedBy", model: User })
//         .populate({ path: "signatures.financeDepartment.signedBy", model: User });

//       if (!po) {
//         res
//           .set(createNoCacheHeaders())
//           .status(404)
//           .json({ message: "Purchase Order not found." });
//         return;
//       }

//       const sig: any = po.signatures?.[role];
//       if (!sig?.signedImg) {
//         res
//           .set(createNoCacheHeaders())
//           .status(400)
//           .json({ message: "No signature to revert for this role." });
//         return;
//       }

//       const signedBy = sig.signedBy;
//       const signedById =
//         typeof signedBy === "object" ? signedBy._id?.toString() : signedBy?.toString();

//       const isAdmin = user.permissionRole === "admin";
//       const isSignedByCurrentUser =
//         !!signedById && signedById === user._id.toString();

//       if (!isAdmin && !isSignedByCurrentUser) {
//         res
//           .set(createNoCacheHeaders())
//           .status(403)
//           .json({ message: "You are not authorized to revert this signature." });
//         return;
//       }

//       // clear fields
//       sig.signedImg = null;
//       sig.signedBy = null;
//       sig.signedAt = null;

//       // business rule: revert -> status back to Pending
//       po.status = "Pending";

//       await po.save();

//       res
//         .set(createNoCacheHeaders())
//         .status(200)
//         .json({ purchaseOrder: po });
//       return;
//     }

//     // ✍️ SIGN FLOW (existing logic)
//     if (!user.signedImg) {
//       res
//         .set(createNoCacheHeaders())
//         .status(400)
//         .json({ message: "User has no saved signature on file." });
//       return;
//     }

//     // ensure user.signatureRole matches the role
//     if (user.signatureRole !== role) {
//       res
//         .set(createNoCacheHeaders())
//         .status(403)
//         .json({ message: "You are not authorized to sign for this role." });
//       return;
//     }

//     const now = new Date();

//     const po = await PurchaseOrder.findByIdAndUpdate(
//       poId,
//       {
//         $set: {
//           [`signatures.${role}.signedImg`]: user.signedImg,
//           [`signatures.${role}.signedBy`]: user._id,
//           [`signatures.${role}.signedAt`]: now,
//           status: "Signed",
//         },
//       },
//       { new: true }
//     )
//       .populate({ path: "department", model: Department })
//       .populate({ path: "signatures.submitter.signedBy", model: User })
//       .populate({ path: "signatures.manager.signedBy", model: User })
//       .populate({ path: "signatures.generalManager.signedBy", model: User })
//       .populate({ path: "signatures.financeDepartment.signedBy", model: User });

//     if (!po) {
//       res
//         .set(createNoCacheHeaders())
//         .status(404)
//         .json({ message: "Purchase Order not found." });
//       return;
//     }

//     res
//       .set(createNoCacheHeaders())
//       .status(200)
//       .json({ purchaseOrder: po });
//   } catch (err: any) {
//     console.error("signPurchaseOrderRole error:", err);
//     res
//       .set(createNoCacheHeaders())
//       .status(400)
//       .json({ message: err.message || "Failed to sign purchase order." });
//   }
// };

export const getMyPendingSignaturePurchaseOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const authUser = (req as any).user; // from protect middleware

    if (!authUser?._id) {
      res
        .set(createNoCacheHeaders())
        .status(401)
        .json({ message: "Not authenticated." });
      return;
    }

    const user = await User.findById(authUser._id);

    if (!user) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "User not found." });
      return;
    }

    const role = user.signatureRole as
      | "submitter"
      | "manager"
      | "generalManager"
      | "financeDepartment"
      | "overrideSigner"
      | undefined;

    const allowedRoles = [
      "submitter",
      "manager",
      "generalManager",
      "financeDepartment",
      "overrideSigner", // include if you want overrideSigner to see everything
    ] as const;

    if (!role || !allowedRoles.includes(role)) {
      // User has no signing responsibility → no notifications
      res
        .set(createNoCacheHeaders())
        .status(200)
        .json({ purchaseOrders: [], count: 0, role: null });
      return;
    }

    // 🔹 Extra: restrict by departments if permissionRole === "user"
    const isUserPermissionUser = user.permissionRole === "user";
    const userDeptIds: any[] =
      isUserPermissionUser && Array.isArray(user.departments)
        ? user.departments.map((d: any) =>
            typeof d === "object" && d._id ? d._id : d
          )
        : [];

    let query: any = {};

    // 🔹 Submitter: show POs where they are the submitter and have not signed yet
    if (role === "submitter") {
      query = {
        "signatures.submitter.signedBy": user._id,
        "signatures.submitter.signedImg": null,
        // status: { $ne: "Rejected" },
      };
    }
    // 🔹 Override signer: any PO where *someone* still needs to sign,
    // as long as there is a submitter assigned.
    else if (role === "overrideSigner") {
      query = {
        "signatures.submitter.signedBy": { $ne: null },
        $or: [
          { "signatures.submitter.signedImg": null },
          { "signatures.manager.signedImg": null },
          { "signatures.generalManager.signedImg": null },
          { "signatures.financeDepartment.signedImg": null },
        ],
        // status: { $ne: "Rejected" },
      };
    }
    // 🔹 Manager / General Manager / Finance Department:
    // submitter exists, this role has not signed yet
    else {
      query = {
        "signatures.submitter.signedBy": { $ne: null },
        [`signatures.${role}.signedImg`]: null,
        // status: { $ne: "Rejected" },
      };
    }

    // ✅ If this person is a normal user, restrict to their departments
    if (isUserPermissionUser && userDeptIds.length > 0) {
      query.department = { $in: userDeptIds };
    }

    const pos = await PurchaseOrder.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "department", model: Department })
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    res
      .set(createNoCacheHeaders())
      .status(200)
      .json({
        purchaseOrders: pos,
        count: pos.length,
        role,
      });
  } catch (err) {
    console.error("getMyPendingSignaturePurchaseOrders error:", err);
    res
      .set(createNoCacheHeaders())
      .status(500)
      .json({ message: "Failed to fetch pending signature purchase orders." });
  }
};

// export const getMyPendingSignaturePurchaseOrders = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const authUser = (req as any).user; // from protect middleware

//     if (!authUser?._id) {
//       res
//         .set(createNoCacheHeaders())
//         .status(401)
//         .json({ message: "Not authenticated." });
//       return;
//     }

//     const user = await User.findById(authUser._id);

//     if (!user) {
//       res
//         .set(createNoCacheHeaders())
//         .status(404)
//         .json({ message: "User not found." });
//       return;
//     }

//     const role = user.signatureRole as
//       | "submitter"
//       | "manager"
//       | "generalManager"
//       | "financeDepartment"
//       | "overrideSigner"
//       | undefined;

//     const allowedRoles = [
//       "submitter",
//       "manager",
//       "generalManager",
//       "financeDepartment",
//       "overrideSigner", // include if you want overrideSigner to see everything
//     ] as const;

//     if (!role || !allowedRoles.includes(role)) {
//       // User has no signing responsibility → no notifications
//       res
//         .set(createNoCacheHeaders())
//         .status(200)
//         .json({ purchaseOrders: [], count: 0, role: null });
//       return;
//     }

//     let query: any = {};

//     // 🔹 Submitter: show POs where they are the submitter and have not signed yet
//     if (role === "submitter") {
//       query = {
//         "signatures.submitter.signedBy": user._id,
//         "signatures.submitter.signedImg": null,
//         // optional: exclude rejected if you ever use that
//         // status: { $ne: "Rejected" },
//       };
//     }
//     // 🔹 Override signer: any PO where *someone* still needs to sign,
//     // as long as there is a submitter assigned.
//     else if (role === "overrideSigner") {
//       query = {
//         "signatures.submitter.signedBy": { $ne: null },
//         $or: [
//           { "signatures.submitter.signedImg": null },
//           { "signatures.manager.signedImg": null },
//           { "signatures.generalManager.signedImg": null },
//           { "signatures.financeDepartment.signedImg": null },
//         ],
//         // status: { $ne: "Rejected" },
//       };
//     }
//     // 🔹 Manager / General Manager / Finance Department:
//     // submitter exists, this role has not signed yet
//     else {
//       query = {
//         "signatures.submitter.signedBy": { $ne: null },
//         [`signatures.${role}.signedImg`]: null,
//         // status: { $ne: "Rejected" },
//       };
//     }

//     const pos = await PurchaseOrder.find(query)
//       .sort({ createdAt: -1 })
//       .populate({ path: "department", model: Department })
//       .populate({ path: "signatures.submitter.signedBy", model: User })
//       .populate({ path: "signatures.manager.signedBy", model: User })
//       .populate({ path: "signatures.generalManager.signedBy", model: User })
//       .populate({ path: "signatures.financeDepartment.signedBy", model: User });

//     res
//       .set(createNoCacheHeaders())
//       .status(200)
//       .json({
//         purchaseOrders: pos,
//         count: pos.length,
//         role,
//       });
//   } catch (err) {
//     console.error("getMyPendingSignaturePurchaseOrders error:", err);
//     res
//       .set(createNoCacheHeaders())
//       .status(500)
//       .json({ message: "Failed to fetch pending signature purchase orders." });
//   }
// };

export const getPurchaseOrderPDF = async (req: Request, res: Response) => {
  try {
    const isDownload = req.query.download === 'true';

    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate({ path: 'department', model: Department })
      // .populate({ path: 'submitter', model: User })
      .populate({ path: 'signatures.submitter.signedBy', model: User })
      .populate({ path: 'signatures.manager.signedBy', model: User })
      .populate({ path: 'signatures.generalManager.signedBy', model: User })
      .populate({ path: 'signatures.financeDepartment.signedBy', model: User })
    .lean<POType>();
    
      if (!purchaseOrder) {
        res
        .set(createNoCacheHeaders())
        .status(404).json({ message: "Purchase order not found" });
        return;
      }
      // @ts-ignore
      // const { generatePdfStream } = await import("../pdf/generatePdf.mjs");
      // const { generatePdfStream } =
      // process.env.NODE_ENV === "production"
      // // @ts-ignore
      // ? await import("../pdf/generatePdf.mjs")
      // // @ts-ignore
      // : await import("../pdf/generatePdf.ts");
      // const pdfStream = await generatePdfStream(purchaseOrder);
    const {
      renderToStream,
      Document,
      Page,
      Text,
      View,
      Image,
      StyleSheet,
    } = await import('@react-pdf/renderer');

    const pdfStream = await renderToStream(<PO_PDF3 purchaseOrder={purchaseOrder}
      Document={Document} 
      Page={Page} 
      Text={Text} 
      View={View} 
      Image={Image}
      StyleSheet={StyleSheet} />);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      isDownload
        ? `attachment; filename="${purchaseOrder?.poNumber}.pdf"`
        : `inline; filename="${purchaseOrder?.poNumber}.pdf"`
    );
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('Netlify-CDN-Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    pdfStream.pipe(res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST: Send email notifying required signers
export const sendPurchaseOrderSignatureEmails = async (req: Request, res: Response) => {
  try {
    if (process.env.DISABLE_ALL_EMAILS === "true") {
      res
        .set(createNoCacheHeaders())
        .status(200)
        .json({ message: "Email sending disabled." });
      return;
    }

    const { purchaseOrderId } = req.body;

    if (!purchaseOrderId) {
      res
        .set(createNoCacheHeaders())
        .status(400)
        .json({ message: "purchaseOrderId is required." });
      return;
    }

    // Load PO
    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId)
      .populate({ path: 'department', model: Department })
      // .populate({ path: 'vendor', model: Vendor })
      // .populate({ path: 'submitter', model: User })
      // .populate({ path: 'signedBy', model: User });
      // Signatures: populate the user in each role
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    if (!purchaseOrder) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "Purchase Order not found." });
      return;
    }

    // Allowed roles that must sign
    const allowedRoles = [
      "generalManager",
      "manager",
      "financeDepartment",
      // "overrideSigner",
    ];

    const testMode = process.env.TEST_MODE === "true";

    // Query users
    const signers = await User.find({
      signatureRole: { $in: allowedRoles },
      ...(testMode ? { testMode: true } : {}),
    });

    if (signers.length === 0) {
      res
        .set(createNoCacheHeaders())
        .status(200)
        .json({ message: "No signers found for this PO." });
      return;
    }

    // Bulk send
    // const emailPromises = signers.map((signer: any) => {
    //   resend.emails.send({
    //     from: "notifications@po-greyrock.com",
    //     to: signer.email,
    //     subject: `Signature Required — Purchase Order #${purchaseOrder.poNumber}`,
    //     react: EmailTemplateNewPORequiresSignature({
    //       purchaseOrder,
    //       signer,
    //     }),
    //   });
    //   return;
    // });
    const emailPromises = signers.map((signer: any) => {
      resend.emails.send({
        from: "Grey Rock Purchase Orders <notifications@po-greyrock.com>",
        to: signer.email,
        subject: `Signature Required — Purchase Order #${purchaseOrder.poNumber}`,
        react: EmailTemplateNewPORequiresSignature({
          purchaseOrder,
          signer,
        }),
      });
      return;
    });

    const results = await Promise.all(emailPromises);

    res
      .set(createNoCacheHeaders())
      .status(200)
      .json({ message: "Signature request emails sent.", results });
    return;

  } catch (error: any) {
    console.error("Email send error:", error);

    res
      .set(createNoCacheHeaders())
      .status(400)
      .json({ message: error.message || "Unexpected error sending emails." });
    return;
  }
};