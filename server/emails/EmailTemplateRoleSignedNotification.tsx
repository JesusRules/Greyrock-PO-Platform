// emails/EmailTemplateRoleSignedNotification.tsx (or .tsx/.js as you prefer)
import React from "react";
import { convertISODateToReadableEnglish } from "../pdf/PO_PDF.js";

interface EmailTemplateRoleSignedNotificationProps {
  purchaseOrder: any;
  approver: any; // user who just signed
  role: "manager" | "generalManager" | "financeDepartment";
}

export function EmailTemplateRoleSignedNotification({
  purchaseOrder,
  approver,
  role,
}: EmailTemplateRoleSignedNotificationProps) {
  const readableDate = convertISODateToReadableEnglish(purchaseOrder.date);

  const roleLabel =
    role === "generalManager"
      ? "General Manager"
      : role === "financeDepartment"
      ? "Finance Department"
      : "Manager";

  const approverName =
    approver && approver.firstName && approver.lastName
      ? `${approver.firstName} ${approver.lastName}`
      : approver?.email || "An approver";

  const submitter =
    purchaseOrder?.signatures?.submitter?.signedBy || purchaseOrder?.submitter;

  const submitterName =
    submitter && typeof submitter === "object"
      ? `${submitter.firstName} ${submitter.lastName}`
      : submitter || "you";

  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.4 }}>
      <h2>
        An update on Purchase Order <b>#{purchaseOrder.poNumber}</b>.
      </h2>

      <p>
        This is to notify you that{" "}
        <b>
          {approverName} ({roleLabel})
        </b>{" "}
        has <b>signed</b> your purchase order.
      </p>

      <p>
        As the submitter (<b>{submitterName}</b>), you’re receiving this message
        so you can track the progress of the approval workflow.
      </p>

      <h3>Purchase Order Details</h3>
      <p>
        <b>PO Number:</b> {purchaseOrder.poNumber}
      </p>
      <p>
        <b>Date:</b> {readableDate}
      </p>
      <p>
        <b>Department:</b> {purchaseOrder.department?.name}
      </p>
      <p>
        <b>Total:</b> ${purchaseOrder.total?.toFixed(2)}
      </p>

      <br />

      <p>
        You can log into the Grey Rock Purchase Order System at any time to see
        which signatures are still pending and review full details.
      </p>

      <p style={{ marginTop: "40px", fontSize: "12px", color: "#777" }}>
        This message was sent automatically by the Grey Rock Purchase Order
        System.
      </p>
    </div>
  );
}
