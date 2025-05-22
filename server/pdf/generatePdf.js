import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { PO_PDF3 } from "./PO_PDF3.js";

export async function generatePdfStream(purchaseOrder) {
  const {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet
  } = await import("@react-pdf/renderer");

  return renderToStream(
    React.createElement(PO_PDF3, {
      purchaseOrder,
      Document,
      Page,
      Text,
      View,
      Image,
      StyleSheet
    })
  );
}
