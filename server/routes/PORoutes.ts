import express from "express";
import { createPurchaseOrder, deletePurchaseOrder, getAllPurchaseOrders, purchaseOrderSign, revertPurchaseOrderSignature, togglePurchaseOrderStatus, updatePurchaseOrder } from "../controllers/POController";

const PORouter = express.Router();

PORouter.post("/", createPurchaseOrder);
PORouter.put("/:id", updatePurchaseOrder);
PORouter.put("/:id/sign", purchaseOrderSign);
PORouter.put("/:id/revert-signature", revertPurchaseOrderSignature);
PORouter.delete("/:id", deletePurchaseOrder);
PORouter.patch("/:id/toggle-status", togglePurchaseOrderStatus);
PORouter.get("/", getAllPurchaseOrders);

export default PORouter;