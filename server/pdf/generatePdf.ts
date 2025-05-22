import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { PO_PDF3 } from "./PO_PDF3";

export async function generatePdfStream(purchaseOrder: any) {
  const {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
  } = await import("@react-pdf/renderer");

  const pdfDoc = PO_PDF3({
    purchaseOrder,
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
  });
// @ts-ignore
  return renderToStream(pdfDoc);
}
