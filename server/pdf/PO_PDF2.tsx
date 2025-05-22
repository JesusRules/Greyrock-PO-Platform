import { PurchaseOrder } from '../../types/PurchaseOrder';
import React from 'react';
import { convertISODateToReadableEnglishTime } from './PO_PDF';

// interface PODocProps {
//   purchaseOrder: PurchaseOrder,
//   Document: typeof import('@react-pdf/renderer').Document;
//   Page: typeof import('@react-pdf/renderer').Page;
//   Text: typeof import('@react-pdf/renderer').Text;
//   View: typeof import('@react-pdf/renderer').View;
//   Image: typeof import('@react-pdf/renderer').Image;
//   StyleSheet: typeof import('@react-pdf/renderer').StyleSheet;
// }
interface PODocProps {
  purchaseOrder: PurchaseOrder;
  Document: any;
  Page: any;
  Text: any;
  View: any;
  Image: any;
  StyleSheet: {
    create: (styles: any) => any;
  };
}

export const PO_PDF2: React.FC<PODocProps> = ({
    purchaseOrder,
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet
}) => {
const logo = 'https://res.cloudinary.com/dl4ncc8uk/image/upload/v1747838147/logo_djty2y.jpg';

   const styles = StyleSheet.create({
    page: {
      padding: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
    },
    logo: {
      width: 100,
      height: 50,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
    },
    orderInfo: {
      marginBottom: 20,
    },
    orderInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
    },
    table: {
        width: '100%',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '20%',
        fontWeight: 'bold',
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#000',
    },
    tableCol: {
        width: '20%',
        padding: 5,
        borderWidth: 1,
        borderColor: '#000',
    },
    // tableRow: {
    //   flexDirection: "row",
    // },
    // tableColHeader: {
    //   width: "20%",
    //   fontWeight: "bold",
    //   padding: 5,
    //   backgroundColor: "#f0f0f0",
    // },
    // tableCol: {
    //   width: "20%",
    //   padding: 5,
    // },
    footer: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 40,
    },
    signatureSection: {
      marginTop: 40,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    signatureField: {
      width: "40%",
      borderTop: "1px solid #000",
      paddingTop: 10,
    },
    signatureLine: {
      width: "100%",
      height: 20,
    },
    signatureTitle: {
      fontSize: 12,
      textAlign: "center",
    },
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src={logo}
            style={styles.logo}
          />
          <Text style={styles.title}>Purchase Order</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.orderInfoRow}>
            <Text>Order Number: {purchaseOrder.poNumber}</Text>
            <Text>Order Date: {convertISODateToReadableEnglishTime(purchaseOrder.date)}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text>Supplier: {'purchaseOrder.supplier'}</Text>
            {/* <Text>Supplier: {purchaseOrder.supplier}</Text> */}
            <Text>Shipping Address: {'purchaseOrder.shippingAddress'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Item</Text>
            <Text style={styles.tableColHeader}>Quantity</Text>
            <Text style={styles.tableColHeader}>Unit Price</Text>
            <Text style={styles.tableColHeader}>Total</Text>
            <Text style={styles.tableColHeader}>Description</Text>
          </View>
          {purchaseOrder.lineItems.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{item.quantity}</Text>
              <Text style={styles.tableCol}>{item.itemId}</Text>
              <Text style={styles.tableCol}>{item.description}</Text>
              <Text style={styles.tableCol}>{item.unitPrice}</Text>
              <Text style={styles.tableCol}>{item.lineTotal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your order!</Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureField}>
            {purchaseOrder.signedImg ? (
              <Image src={purchaseOrder.signedImg || logo} style={{ width: 150, height: 50 }} />
            ) : (
              <View style={styles.signatureLine}></View>
            )}
            <Text style={styles.signatureTitle}>Submitter</Text>
          </View>
          <View style={styles.signatureField}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Approver</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
