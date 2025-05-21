import  { PurchaseOrder } from "../../types/PurchaseOrder"
import  React from "react"
import { convertISODateToReadableEnglish } from "./PO_PDF"
import { truncateWithSmartDots } from "../utils/general"

interface PODocProps {
  purchaseOrder: PurchaseOrder
  Document: typeof import("@react-pdf/renderer").Document
  Page: typeof import("@react-pdf/renderer").Page
  Text: typeof import("@react-pdf/renderer").Text
  View: typeof import("@react-pdf/renderer").View
  Image: typeof import("@react-pdf/renderer").Image
  StyleSheet: typeof import("@react-pdf/renderer").StyleSheet
}

export const PO_PDF3: React.FC<PODocProps> = ({ purchaseOrder, Document, Page, Text, View, Image, StyleSheet }) => {
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      paddingTop: 40,
      fontFamily: "Helvetica",
      backgroundColor: "#fff",
    },
    headerRow: {
      flexDirection: "row",
      marginBottom: 15,
      borderBottom: "1px solid #000",
      paddingBottom: 20,
      alignItems: "center",

      //Add to all components
      marginHorizontal: 'auto',
      maxWidth: '530px', //570
      width: '100%'
    },
    logo: {
      width: 95,
      height: 95,
    },
    companyInfoContainer: {
      flex: 1,
      alignItems: "center", // Center the text
      marginLeft: -85, // Adjust to center with larger logo
    },
    section: {
      marginBottom: 10,
      marginTop: 9,
       //Add to all components
      marginHorizontal: 'auto',
      maxWidth: '530px',
      width: '100%'
    },
    table: {
      borderWidth: 1,
      borderColor: "#000",
      marginTop: 25,
      marginBottom: 20,
    },
    tableRow: {
      flexDirection: "row",
      minHeight: 25,
      alignItems: "center",
    },
    tableCellHeader: {
      borderWidth: 1,
      borderColor: "#000",
      backgroundColor: "#e4e4e4",
      padding: 6,
      fontWeight: "bold",
      textAlign: "center",
    },
    tableCell: {
      borderWidth: 1,
      borderColor: "#000",
      padding: 6,
      textAlign: "center",
      height: '100%'
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: 5,
    },
    infoLabel: {
      width: 120,
      fontWeight: "bold",
    },
    infoValue: {
      flex: 1,
    },
    companyHeader: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
      textAlign: "center", // Center the text
    },
    companyAddress: {
      fontSize: 9,
      marginBottom: 3,
      textAlign: "center", // Center the text
    },
    companyContact: {
      fontSize: 9,
      marginBottom: 3,
      textAlign: "center", // Center the text
    },
    departmentHeader: {
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 10,
      marginBottom: 20,
      padding: 5,
      backgroundColor: "#e4e4e4",
      borderRadius: 3,
       //Add to all components
      marginHorizontal: 'auto',
      maxWidth: '530px',
      width: '100%'
    },
    summaryContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      //Add to all components
      marginHorizontal: 'auto',
      maxWidth: '530px',
      width: '100%'
    },
    approvalSection: {
      width: "50%",
      top: 10
    },
    totalsSection: {
      width: "40%",
      alignSelf: "flex-end",
      bottom: 0
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottom: "1px solid #ddd",
      paddingVertical: 3,
    },
    totalLabel: {
      fontWeight: "bold",
    },
    grandTotal: {
      fontWeight: "bold",
      marginTop: 5,
      borderTopWidth: 2,
      borderTopColor: "#000",
      paddingTop: 3,
    },
    signatureBox: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 80 * 1.1,
      width: 200 * 1.1,
      border: "1px solid #000",
      marginBottom: 6, // Increased spacing
      marginTop: 37, // Added spacing above signature box
    },
    dateInfoContainer: {
      position: "absolute",
      top: 230, // 220
      right: 40,
      width: 200,
    //   borderWidth: 1,
    //   borderColor: "#000",
      padding: 10,
      borderRadius: 5,
      backgroundColor: "#fff",
      //Add to all components - RIGHT
      marginRight: 32
    },
    dateInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    dateInfoLabel: {
      fontWeight: "bold",
    },
    submitterRow: {
      flexDirection: "row",
      marginBottom: 0, // Added spacing below submitter
    },
    submitterLabel: {
      fontWeight: "bold",
      width: 64, // Fixed width for label
    },
    submitterName: {
      marginLeft: 0, // Reduced spacing to move name closer to label
    },
    //FOOTER
    pageNumbers: {
        position: 'absolute',
        bottom: 15,
        right: 30,
        textAlign: 'center',
        fontSize: 9,
    },
        generatedText: {
        position: 'absolute',
        bottom: 13,
        left: 18,
        textAlign: 'center',
        fontSize: 9,
    },
  })

  // Calculate subtotal, tax, and total
  const subtotal = purchaseOrder.lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
  const taxRate = purchaseOrder.taxAmount / 100
  const salesTax = subtotal * taxRate
  const shipping = 0 // Set shipping cost if available
  const total = subtotal + salesTax + shipping

  // Column widths for the table
  const quantityWidth = "11%" // Increased quantity column width
  const itemIdWidth = "15%"
  const descriptionWidth = "48%" // Adjusted to maintain total width
  const unitPriceWidth = "15%"
  const lineTotalWidth = "15%"

  return (
    <Document>
      {/* <Page size={{ width: 612, height: 792 }} style={styles.page}> */}
      <Page size={{ width: 700, height: 792 }} style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Image
              src="https://res.cloudinary.com/dl4ncc8uk/image/upload/v1747838147/logo_djty2y.jpg"
              style={styles.logo}
            />
          </View>

          <View style={styles.companyInfoContainer}>
            <Text style={styles.companyHeader}>Grey Rock Entertainment Center Inc.</Text>
            <Text style={styles.companyAddress}>
              100 Chief Joanna Blvd, Madawaska Maliseet First Nation, NB, E7C 0C1
            </Text>
            <Text style={styles.companyContact}>Finance Contact: Emily-Rose Robinson</Text>
            <Text style={styles.companyContact}>Phone Number: 506-735-2838</Text>
            <Text style={styles.companyContact}>Send invoices to: Finance@GreyRock-Casino.com</Text>
          </View>
        </View>

        {/* Department Header */}
        <View>
          <Text style={styles.departmentHeader}>{purchaseOrder.department.name.toUpperCase()}</Text>
        </View>

        {/* Date, PO#, Payment info - positioned higher up */}
        <View style={styles.dateInfoContainer}>
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateInfoLabel}>Date</Text>
            <Text>{convertISODateToReadableEnglish(purchaseOrder.date)}</Text>
          </View>
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateInfoLabel}>PO #</Text>
            <Text>{purchaseOrder.poNumber}</Text>
          </View>
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateInfoLabel}>Payment</Text>
            <Text>{purchaseOrder.paymentMethod}</Text>
          </View>
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateInfoLabel}>Submitter</Text>
            <Text>
              {typeof purchaseOrder.submitter === "object"
              ? `${purchaseOrder.submitter.firstName} ${purchaseOrder.submitter.lastName}`
              : purchaseOrder.submitter}
            </Text>
          </View>
        </View>

        {/* Vendor Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vendor</Text>
            <Text style={styles.infoValue}>{purchaseOrder.vendor?.companyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Name</Text>
            <Text style={styles.infoValue}>{purchaseOrder.vendor?.contactName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{purchaseOrder.vendor?.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{purchaseOrder.vendor?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cheque Payable To</Text>
            <Text style={styles.infoValue}>{purchaseOrder.vendor?.payableTo}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellHeader, { width: quantityWidth }]}>Quantity</Text>
            <Text style={[styles.tableCellHeader, { width: itemIdWidth }]}>Item ID</Text>
            <Text style={[styles.tableCellHeader, { width: descriptionWidth }]}>Description</Text>
            <Text style={[styles.tableCellHeader, { width: unitPriceWidth }]}>Unit Price</Text>
            <Text style={[styles.tableCellHeader, { width: lineTotalWidth }]}>Line Total</Text>
          </View>

          {/* Let items auto-wrap and flow across pages */}
          {purchaseOrder.lineItems.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, { width: quantityWidth }]}>{item?.quantity || ""}</Text>
              <Text style={[styles.tableCell, { width: itemIdWidth }]}>{truncateWithSmartDots(item?.itemId || "", 11)}</Text>
              <Text style={[styles.tableCell, { width: descriptionWidth }]}>{item?.description || ""}</Text>
              <Text style={[styles.tableCell, { width: unitPriceWidth }]}>{item?.unitPrice?.toFixed(2) || "0.00"}</Text>
              <Text style={[styles.tableCell, { width: lineTotalWidth }]}>{item?.lineTotal?.toFixed(2) || "0.00"}</Text>
            </View>
          ))}
        </View>

        {/* Submitter Row - Adjusted to move name closer to label */}
        {/* <View style={styles.submitterRow}>
          <Text style={styles.submitterLabel}>Submitter</Text>
          <Text style={styles.submitterName}>John Doe</Text>
        </View> */}

        {/* Summary Section */}
        <View style={styles.summaryContainer} wrap={false}>
          
          {/* Approval Section - Moved down with more spacing */}
          <View style={styles.approvalSection}>
            {/* Signature Box */}
            <View style={styles.signatureBox}>
            {purchaseOrder.signedImg ? (
                <Image
                src={purchaseOrder.signedImg}
                style={{ width: "100%", height: "100%", objectFit: 'cover', padding: 40 }}
                />
            ) : (
                <Text style={{ fontSize: 10, textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                No signature
                </Text>
            )}
            </View>
            <View>
              <Text style={{ fontSize: 9, fontStyle: "italic" }}>Cindy Bernard, General</Text>
            </View>
          </View>

          {/* Totals Section */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax Rate</Text>
              <Text>{(taxRate * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sales Tax</Text>
              <Text>${salesTax.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text>${shipping.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalLabel}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text
            style={styles.pageNumbers}
            render={(props: { pageNumber: number; totalPages: number }) =>
              `Page ${props.pageNumber} of ${props.totalPages}`
            }
            fixed
          />
        <Text style={styles.generatedText} fixed>
          Purchase Order generated on{' '}
          {new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>

      </Page>
    </Document>
  )
}
