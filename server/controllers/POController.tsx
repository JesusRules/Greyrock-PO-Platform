import { Request, Response } from "express";
import PurchaseOrder from "../models/PO";
import User from "../models/User";
import Vendor from "../models/Vendor";
import Department from "../models/Department";
import { createNoCacheHeaders } from "../utils/noCacheResponse";
import { v2 as cloudinary } from "cloudinary";
import React from 'react';
import { PurchaseOrder as POType } from "../../types/PurchaseOrder";
import { PO_PDF } from '../pdf/PO_PDF'
import { PO_PDF2 } from "../pdf/PO_PDF2";
import { PO_PDF3 } from "../pdf/PO_PDF3";

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
      .populate({ path: 'submitter', model: User })
      .populate({ path: 'signedBy', model: User });

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
      .populate({ path: 'submitter', model: User })
      .populate({ path: 'signedBy', model: User });

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
    .populate({ path: 'submitter', model: User })
    .populate({ path: 'signedBy', model: User });

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
      .populate({ path: "department", model: Department })
      .populate({ path: "vendor", model: Vendor })
      .populate({ path: "submitter", model: User })
      .populate({ path: "signedBy", model: User });

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

export const purchaseOrderSign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { signature, signedBy } = req.body;
    const id = req.params.id;

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      res
      .set(createNoCacheHeaders())
      .status(404).json({ message: "Purchase order not found" });
      return;
    }

    // Delete old signature if exists
    if (purchaseOrder.signedImg !== null && purchaseOrder.signedImg !== undefined) {
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
    purchaseOrder.signedBy = signedBy;
    await purchaseOrder.save();

    const populatedOrder = await PurchaseOrder.findById(purchaseOrder._id)
      .populate({ path: 'department', model: Department })
      .populate({ path: 'vendor', model: Vendor })
      .populate({ path: 'submitter', model: User })
      .populate({ path: 'signedBy', model: User });

    res.status(201).set(createNoCacheHeaders()).json({
      message: "Signature saved",
      purchaseOrder: populatedOrder,
    });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).set(createNoCacheHeaders()).json({ error: "Server error" });
  }
};

// PUT /api/purchase-orders/:id/revert-signature
export const revertPurchaseOrderSignature = async (req: Request, res: Response) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res
      .set(createNoCacheHeaders())
      .status(404).json({ message: "PO not found" });
      return;
    }

    // Delete old signature if exists
    if (order.signedImg) {
      const urlParts = order.signedImg.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `po_signed/${fileName.split(".")[0]}`;

      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Deleted previous signature: ${publicId}`);
      } catch (deleteErr) {
        console.warn("⚠️ Failed to delete old signature:", deleteErr);
      }
    }

    order.signedImg = null;
    order.signedBy = null;
    order.status = "Pending";
    await order.save();

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate({ path: 'department', model: Department })
      .populate({ path: 'vendor', model: Vendor })
      .populate({ path: 'submitter', model: User })
      .populate({ path: 'signedBy', model: User });

    res
    .set(createNoCacheHeaders())
    .status(200).json({ message: "Signature reverted", purchaseOrder: populatedOrder });
  } catch (err) {
    console.error("Error reverting signature:", err);
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to revert signature", error: err });
  }
};

export const getPurchaseOrderPDF = async (req: Request, res: Response) => {
  try {
    const isDownload = req.query.download === 'true';

   const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate({ path: 'department', model: Department })
      .populate({ path: 'vendor', model: Vendor })
      .populate({ path: 'submitter', model: User })
      .populate({ path: 'signedBy', model: User })
      .lean<POType>()
    
      if (!purchaseOrder) {
        res
        .set(createNoCacheHeaders())
        .status(404).json({ message: "Purchase order not found" });
        return;
      }

    const {
      renderToStream,
      Document,
      Page,
      Text,
      View,
      Image,
      StyleSheet,
    } = await import('@react-pdf/renderer');
    // const pdfStream = await renderToStream(<BCRDoc bcr={populatedBCR}
    //     Document={Document} 
    //     Page={Page} 
    //     Text={Text} 
    //     View={View} 
    //     Image={Image}
    //     StyleSheet={StyleSheet} />);
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
