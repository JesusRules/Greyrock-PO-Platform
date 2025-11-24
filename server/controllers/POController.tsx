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

// POST create
export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = new PurchaseOrder(req.body);
    const savedOrder = await newOrder.save();

    const populatedOrder = await PurchaseOrder.findById(savedOrder._id)
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
    .status(201)
    .set(createNoCacheHeaders())
    .json({ purchaseOrder: populatedOrder });
  } catch (err) {
    console.error(err);
    res
    .status(400)
    .set(createNoCacheHeaders())
    .json({ message: "Failed to create purchase order", error: err });
  }
};

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

    let nextStatus: "Pending" | "Signed" | "Rejected";

    if (order.status === "Pending" || order.status === "Signed") {
      nextStatus = "Rejected";
    } else if (order.status === "Rejected") {
      nextStatus = order.signedImg ? "Signed" : "Pending";
    } else {
      nextStatus = "Pending"; // fallback safety
    }

    order.status = nextStatus;
    await order.save();

    const populatedOrder = await PurchaseOrder.findById(order._id)
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

    const allowedRoles = ["manager", "generalManager", "financeDepartment"];
    if (!allowedRoles.includes(role)) {
      res
        .set(createNoCacheHeaders())
        .status(400)
        .json({ message: "Invalid signature role." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res
        .set(createNoCacheHeaders())
        .status(400)
        .json({ message: "User not found." });
      return;
    }

    // 🔁 REVERT FLOW
    if (revert) {
      const po = await PurchaseOrder.findById(poId)
        .populate({ path: "department", model: Department })
        .populate({ path: "signatures.submitter.signedBy", model: User })
        .populate({ path: "signatures.manager.signedBy", model: User })
        .populate({ path: "signatures.generalManager.signedBy", model: User })
        .populate({ path: "signatures.financeDepartment.signedBy", model: User });

      if (!po) {
        res
          .set(createNoCacheHeaders())
          .status(404)
          .json({ message: "Purchase Order not found." });
        return;
      }

      const sig: any = po.signatures?.[role];
      if (!sig?.signedImg) {
        res
          .set(createNoCacheHeaders())
          .status(400)
          .json({ message: "No signature to revert for this role." });
        return;
      }

      const signedBy = sig.signedBy;
      const signedById =
        typeof signedBy === "object" ? signedBy._id?.toString() : signedBy?.toString();

      const isAdmin = user.permissionRole === "admin";
      const isSignedByCurrentUser =
        !!signedById && signedById === user._id.toString();

      if (!isAdmin && !isSignedByCurrentUser) {
        res
          .set(createNoCacheHeaders())
          .status(403)
          .json({ message: "You are not authorized to revert this signature." });
        return;
      }

      // clear fields
      sig.signedImg = null;
      sig.signedBy = null;
      sig.signedAt = null;

      // business rule: revert -> status back to Pending
      po.status = "Pending";

      await po.save();

      res
        .set(createNoCacheHeaders())
        .status(200)
        .json({ purchaseOrder: po });
      return;
    }

    // ✍️ SIGN FLOW (existing logic)
    if (!user.signedImg) {
      res
        .set(createNoCacheHeaders())
        .status(400)
        .json({ message: "User has no saved signature on file." });
      return;
    }

    // ensure user.signatureRole matches the role
    if (user.signatureRole !== role) {
      res
        .set(createNoCacheHeaders())
        .status(403)
        .json({ message: "You are not authorized to sign for this role." });
      return;
    }

    const now = new Date();

    const po = await PurchaseOrder.findByIdAndUpdate(
      poId,
      {
        $set: {
          [`signatures.${role}.signedImg`]: user.signedImg,
          [`signatures.${role}.signedBy`]: user._id,
          [`signatures.${role}.signedAt`]: now,
          status: "Signed",
        },
      },
      { new: true }
    )
      .populate({ path: "department", model: Department })
      .populate({ path: "signatures.submitter.signedBy", model: User })
      .populate({ path: "signatures.manager.signedBy", model: User })
      .populate({ path: "signatures.generalManager.signedBy", model: User })
      .populate({ path: "signatures.financeDepartment.signedBy", model: User });

    if (!po) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "Purchase Order not found." });
      return;
    }

    res
      .set(createNoCacheHeaders())
      .status(200)
      .json({ purchaseOrder: po });
  } catch (err: any) {
    console.error("signPurchaseOrderRole error:", err);
    res
      .set(createNoCacheHeaders())
      .status(400)
      .json({ message: err.message || "Failed to sign purchase order." });
  }
};

// OLD Submitter way (created Cloudinary)
// export const purchaseOrderSign = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { signature, signedBy } = req.body;
//     const id = req.params.id;

//     const purchaseOrder = await PurchaseOrder.findById(id);
//     if (!purchaseOrder) {
//       res
//       .set(createNoCacheHeaders())
//       .status(404).json({ message: "Purchase order not found" });
//       return;
//     }

//     // Delete old signature if exists
//     if (purchaseOrder.signedImg !== null && purchaseOrder.signedImg !== undefined) {
//       const urlParts = purchaseOrder.signedImg.split("/");
//       const fileName = urlParts[urlParts.length - 1];
//       const publicId = `po_signed/${fileName.split(".")[0]}`;

//       try {
//         await cloudinary.uploader.destroy(publicId);
//         console.log(`🗑️ Deleted previous signature: ${publicId}`);
//       } catch (deleteErr) {
//         console.warn("⚠️ Failed to delete old signature:", deleteErr);
//       }
//     }

//     // Upload new signature to Cloudinary
//     const cloudinaryRes = await cloudinary.uploader.upload(signature, {
//       folder: "po_signed",
//     });

//     purchaseOrder.signedImg = cloudinaryRes.secure_url;
//     purchaseOrder.status = 'Signed';
//     purchaseOrder.signedBy = signedBy;
//     await purchaseOrder.save();

//     const populatedOrder = await PurchaseOrder.findById(purchaseOrder._id)
//       .populate({ path: 'department', model: Department })
//       // .populate({ path: 'vendor', model: Vendor })
//       // .populate({ path: 'submitter', model: User })
//       // .populate({ path: 'signedBy', model: User });
//       // Signatures: populate the user in each role
//       .populate({ path: "signatures.submitter.signedBy", model: User })
//       .populate({ path: "signatures.manager.signedBy", model: User })
//       .populate({ path: "signatures.generalManager.signedBy", model: User })
//       .populate({ path: "signatures.financeDepartment.signedBy", model: User });

//     res.status(201).set(createNoCacheHeaders()).json({
//       message: "Signature saved",
//       purchaseOrder: populatedOrder,
//     });
//   } catch (error) {
//     console.error("Signature error:", error);
//     res.status(500).set(createNoCacheHeaders()).json({ error: "Server error" });
//   }
// };

// OLD Submitter way (destroyed Cloudinary)
// PUT /api/purchase-orders/:id/revert-signature
// export const revertPurchaseOrderSignature = async (req: Request, res: Response) => {
//   try {
//     const order = await PurchaseOrder.findById(req.params.id);
//     if (!order) {
//       res
//       .set(createNoCacheHeaders())
//       .status(404).json({ message: "PO not found" });
//       return;
//     }

//     // Delete old signature if exists
//     if (order.signedImg) {
//       const urlParts = order.signedImg.split("/");
//       const fileName = urlParts[urlParts.length - 1];
//       const publicId = `po_signed/${fileName.split(".")[0]}`;

//       try {
//         await cloudinary.uploader.destroy(publicId);
//         console.log(`🗑️ Deleted previous signature: ${publicId}`);
//       } catch (deleteErr) {
//         console.warn("⚠️ Failed to delete old signature:", deleteErr);
//       }
//     }

//     order.signedImg = null;
//     order.signedBy = null;
//     order.status = "Pending";
//     await order.save();

//     const populatedOrder = await PurchaseOrder.findById(order._id)
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
//     .set(createNoCacheHeaders())
//     .status(200).json({ message: "Signature reverted", purchaseOrder: populatedOrder });
//   } catch (err) {
//     console.error("Error reverting signature:", err);
//     res
//     .set(createNoCacheHeaders())
//     .status(500).json({ message: "Failed to revert signature", error: err });
//   }
// };

export const getPurchaseOrderPDF = async (req: Request, res: Response) => {
  try {
    const isDownload = req.query.download === 'true';

  //  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
  //     .populate({ path: 'department', model: Department })
  //     .populate({ path: 'vendor', model: Vendor })
  //     .populate({ path: 'submitter', model: User })
  //     .populate({ path: 'signedBy', model: User })
  //     .lean<POType>()
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
      "overrideSigner",
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