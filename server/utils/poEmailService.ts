// utils/poEmailService.ts
// import { User } from "../models/userModel";
// import { PurchaseOrder } from "../models/purchaseOrderModel";
// import { Department } from "../models/departmentModel";
// import { resend } from "../config/resend"; // wherever you import this
// import EmailTemplateNewPORequiresSignature from "../emails/EmailTemplateNewPORequiresSignature";
// import EmailTemplateRoleSignedNotification from "../emails/EmailTemplateRoleSignedNotification"; // you'll create this
import { EmailTemplateRoleSignedNotification } from "server/emails/EmailTemplateRoleSignedNotification.js";
import { EmailTemplateNewPORequiresSignature } from "../emails/EmailTemplateNewPORequiresSignature.js";
import User from "../models/User.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APPROVER_ROLES = [
  "generalManager",
  "manager",
  "financeDepartment",
] as const;

const testMode = process.env.TEST_MODE === "true";

export async function sendApproverSignatureEmails(purchaseOrder: any) {
  if (process.env.DISABLE_ALL_EMAILS === "true") return;

  // Same logic you had in sendPurchaseOrderSignatureEmails:
  const signers = await User.find({
    signatureRole: { $in: APPROVER_ROLES },
    ...(testMode ? { testMode: true } : {}),
  });

  if (!signers.length) return;

  const emailPromises = signers.map((signer: any) =>
    resend.emails.send({
      from: "Grey Rock Purchase Orders <notifications@po-greyrock.com>",
      to: signer.email,
      subject: `Signature Required — Purchase Order #${purchaseOrder.poNumber}`,
      react: EmailTemplateNewPORequiresSignature({
        purchaseOrder,
        signer,
      }),
    })
  );

  await Promise.all(emailPromises);
}

/**
 * Notify submitter that an approver (manager/GM/finance) has signed.
 */
export async function sendSubmitterRoleSignedEmail(opts: {
  purchaseOrder: any;
  approverUser: any;
  role: "manager" | "generalManager" | "financeDepartment";
}) {
  if (process.env.DISABLE_ALL_EMAILS === "true") return;

  const { purchaseOrder, approverUser, role } = opts;
  const submitterSig = purchaseOrder.signatures?.submitter;
  const submitter = submitterSig?.signedBy;

  if (!submitter || typeof submitter !== "object" || !submitter.email) return;

  await resend.emails.send({
    from: "Grey Rock Purchase Orders <notifications@po-greyrock.com>",
    to: submitter.email,
    subject: `Purchase Order #${purchaseOrder.poNumber} updated`,
    react: EmailTemplateRoleSignedNotification({
      purchaseOrder,
      approver: approverUser,
      role,
    }),
  });
}

/**
 * Notify submitter that a PO was created and they must log in and sign.
 */
export async function sendSubmitterNeedsToSignEmail(purchaseOrder: any) {
  if (process.env.DISABLE_ALL_EMAILS === "true") return;

  const submitterSig = purchaseOrder.signatures?.submitter;
  const submitter = submitterSig?.signedBy;

  if (!submitter || typeof submitter !== "object" || !submitter.email) return;

  await resend.emails.send({
    from: "Grey Rock Purchase Orders <notifications@po-greyrock.com>",
    to: submitter.email,
    subject: `Signature Required — Purchase Order #${purchaseOrder.poNumber}`,
    // you can reuse an existing template or make one just for submitters:
    react: EmailTemplateNewPORequiresSignature({
      purchaseOrder,
      signer: submitter,
    }),
  });
}
