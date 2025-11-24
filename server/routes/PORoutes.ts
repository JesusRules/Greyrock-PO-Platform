import express from "express";
import { createPurchaseOrder, deletePurchaseOrder, getAllPurchaseOrders, getPurchaseOrderPDF, sendPurchaseOrderSignatureEmails, signPurchaseOrderRoleController, togglePurchaseOrderStatus, updatePurchaseOrder } from "../controllers/POController.js";
import { protect } from "../middleware/auth.js";

const PORouter = express.Router();

PORouter.post("/", createPurchaseOrder);
PORouter.patch("/:id/sign-role", protect, signPurchaseOrderRoleController); // Has to be high here
// Emails
PORouter.post("/send-signature-emails", sendPurchaseOrderSignatureEmails);
// Others
PORouter.put("/:id", updatePurchaseOrder);
// routes/purchaseOrderRoutes.ts
// PORouter.put("/:id/sign", purchaseOrderSign);
// PORouter.put("/:id/revert-signature", revertPurchaseOrderSignature);
PORouter.delete("/:id", deletePurchaseOrder);
PORouter.patch("/:id/toggle-status", togglePurchaseOrderStatus);
PORouter.get('/pdf/:id', getPurchaseOrderPDF);
PORouter.get("/", getAllPurchaseOrders);

export default PORouter;