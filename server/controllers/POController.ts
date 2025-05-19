import { Request, Response } from "express";
import PurchaseOrder from "../models/PO";

// GET all
export const getAllPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase orders" });
  }
};

// POST create
export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = new PurchaseOrder(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create purchase order", error: err });
  }
};

// PUT update
export const updatePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const updated = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: "Purchase order not found" });
      return;
    }
      
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update purchase order", error: err });
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
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete purchase order", error: err });
  }
};

// PATCH toggle status
export const togglePurchaseOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Purchase order not found" });
      return;
    }

    const nextStatus =
      order.status === "Pending" ? "Signed" :
      order.status === "Signed" ? "Rejected" : "Pending";

    order.status = nextStatus;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle status", error: err });
  }
};
