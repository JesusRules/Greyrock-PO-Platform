import { Request, Response } from "express";
import PurchaseOrder from "../models/PO";
import User from "../models/User";
import Vendor from "../models/Vendor";
import Department from "../models/Department";
import { createNoCacheHeaders } from "../utils/noCacheResponse";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET all
export const getAllPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const orders = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'department', model: Department })
      .populate({ path: 'vendor', model: Vendor })
      .populate({ path: 'submitter', model: User });

    res
    .status(200)
    .set(createNoCacheHeaders())
    .json({ purchaseOrders: orders });
  } catch (err) {
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
      .populate({ path: 'vendor', model: Vendor })
      .populate({ path: 'submitter', model: User });

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
    .populate({ path: 'vendor', model: Vendor })
    .populate({ path: 'submitter', model: User });

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
      .status(404).json({ message: "Purchase order not found" });
      return;
    }

    const nextStatus =
      order.status === "Pending" ? "Signed" :
      order.status === "Signed" ? "Pending" : "Rejected";
      // order.status === "Signed" ? "Rejected" : "Pending";

    order.status = nextStatus;
    await order.save();

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate({ path: 'department', model: Department })
      .populate({ path: 'vendor', model: Vendor })
      .populate({ path: 'submitter', model: User });

    res
    .set(createNoCacheHeaders())
    .json({ purchaseOrder: populatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500)
    .set(createNoCacheHeaders())
    .json({ message: "Failed to toggle status", error: err });
  }
};

export const purchaseOrderSign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { signature } = req.body;
    const id = req.params.id;

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      res
      .set(createNoCacheHeaders())
      .status(404).json({ message: "Purchase order not found" });
      return;
    }

    // Delete old signature if exists
    if (purchaseOrder.signedImg) {
      const urlParts = purchaseOrder.signedImg.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `po_signed/${fileName.split(".")[0]}`;

      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Deleted previous signature: ${publicId}`);
      } catch (deleteErr) {
        console.warn("⚠️ Failed to delete old signature:", deleteErr);
      }
    }

    // Upload new signature to Cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(signature, {
      folder: "po_signed",
    });

    purchaseOrder.signedImg = cloudinaryRes.secure_url;
    purchaseOrder.status = 'Signed';

    await purchaseOrder.save();

    res.status(201).set(createNoCacheHeaders()).json({
      message: "Signature saved",
      purchaseOrder,
    });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).set(createNoCacheHeaders()).json({ error: "Server error" });
  }
};