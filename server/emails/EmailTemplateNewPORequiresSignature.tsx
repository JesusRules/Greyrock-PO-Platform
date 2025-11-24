import React from "react";
import { convertISODateToReadableEnglish } from "../pdf/PO_PDF.js";

// Define props for this email template
interface EmailTemplateNewPORequiresSignatureProps {
  purchaseOrder: any;
  signer: any; // add signatureRole to your user type
}

export function EmailTemplateNewPORequiresSignature({
  purchaseOrder,
  signer,
}: EmailTemplateNewPORequiresSignatureProps) {

  const readableDate = convertISODateToReadableEnglish(purchaseOrder.date);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.4 }}>
      <h2>
        A new Purchase Order <b>#{purchaseOrder.poNumber}</b> has been created.
      </h2>

      <p>
        You are receiving this email because you are assigned the signature role:{" "}
        <b>{signer.signatureRole === 'generalManager' ? 'General Manager' : signer.signatureRole === 'financeDepartment' ? 'Finance Department' 
          : signer.signatureRole === 'overrideSigner' ? 'Override Signer' : signer.signatureRole}</b>.
        {/* <b>{signer.signatureRole}</b>. */}
      </p>

      <p>Your signature is required to continue the approval process.</p>

      <h3>Purchase Order Details</h3>
      <p><b>PO Number:</b> {purchaseOrder.poNumber}</p>
      <p><b>Date:</b> {readableDate}</p>
      <p><b>Department:</b> {purchaseOrder.department?.name}</p>

      {/* <p>
        <b>Submitter:</b>{" "}
        {typeof purchaseOrder.submitter === "object"
          ? `${purchaseOrder.submitter.firstName} ${purchaseOrder.submitter.lastName}`
          : purchaseOrder.submitter}
      </p> */}
      <p>
        <b>Submitter:</b>{" "}
        {typeof purchaseOrder.signatures.submitter.signedBy === "object"
          ? `${purchaseOrder.signatures.submitter.signedBy.firstName} ${purchaseOrder.signatures.submitter.signedBy.lastName}`
          : purchaseOrder.signatures.submitter.signedBy}
      </p>

      <p><b>Total:</b> ${purchaseOrder.total?.toFixed(2)}</p>

      <br />

      <p>
        Please log into the Purchase Order System to sign this PO as soon as
        possible.
      </p>

      <p style={{ marginTop: "40px", fontSize: "12px", color: "#777" }}>
        This message was sent automatically by the Grey Rock Purchase Order System.
      </p>
    </div>
  );
}
