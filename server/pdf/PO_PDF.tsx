import { PurchaseOrder } from '../../types/PurchaseOrder';
import React from 'react';

// export interface BCRProps {
//   bcr: {
//     reserve: {
//       name: string;
//       province: string;
//       reserveImg?: string;
//     };
//     department?: {
//       name: string;
//     };
//     resolutionNumber: string;
//     dulyConvenedMeeting: string;
//     whereAsPurpose: string;
//     whereAsBackground: string;
//     whereAsClauses: BCRClause[];
//     whereAsBeItResolved: string;
//     quorum: string;
//     participantUsers: BCRParticipant[];
//     departmentId?: string;
//   };
// }

// interface PODocProps extends BCRProps {
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

// const styles = StyleSheet.create({
//   page: {
//     backgroundColor: 'white',
//     margin: '14px',
//     // width: '94.4%',
//     width: '100%',
//     paddingBottom: 50,
//   },
//   header: {
//     width: '94.4%',
//     height: '8.2rem',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderBottom: '2px solid #000000',
//   },
//   pageNumbers: {
//     position: 'absolute',
//     bottom: 28,
//     right: 45,
//     textAlign: 'center',
//     fontSize: 10,
//   },
//   generatedText: {
//     position: 'absolute',
//     bottom: 28,
//     left: 7,
//     textAlign: 'center',
//     fontSize: 10,
//   },
// });

export const PO_PDF: React.FC<PODocProps> = ({
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
        backgroundColor: 'white',
        margin: '14px',
        width: '100%',
        paddingBottom: 50,
      },
      header: {
        width: '94.4%',
        height: '8.2rem',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '2px solid #000000',
      },
      pageNumbers: {
        position: 'absolute',
        bottom: 28,
        right: 45,
        textAlign: 'center',
        fontSize: 10,
      },
      generatedText: {
        position: 'absolute',
        bottom: 28,
        left: 7,
        textAlign: 'center',
        fontSize: 10,
      },
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginRight: 37 }}>
            <Image
              src={logo}
              style={{ width: 74, height: 74, borderRadius: 62.5, objectFit: 'cover' }}
            />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ marginBottom: 5, fontSize: 12, fontWeight: 'bold' }}>
                {purchaseOrder.vendor.companyName}
                </Text>
              <Text style={{ fontSize: 20, border: '1px solid black', padding: 4 }}>
                Band Council Resolution
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 10, flexDirection: 'row', gap: 50 }}>
            <Text style={{ fontSize: 11 }}>
              Department:{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {purchaseOrder.department.name || 'None'}
                {/* **DEPARTMENT** */}
              </Text>
            </Text>
            <Text style={{ fontSize: 11 }}>
              Resolution #: <Text style={{ fontWeight: 'bold' }}>
                {purchaseOrder.poNumber}
                {/* **RESOLUTION_NUMBER** */}
                </Text>
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={{ marginTop: 30, textAlign: 'center', position: 'relative' }}>
          <Text style={{ fontSize: 11 }}>
            The Council of the{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {purchaseOrder.vendor.contactName}, {purchaseOrder.vendor.address}
              {/* **RESERVE_NAME**, **RESERVE_PROVINCE** */}
            </Text>
          </Text>
          <Text style={{ fontSize: 11, marginTop: 6 }}>
            Date of Duly Convened Meeting:{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {convertISODateToReadableEnglishTime(purchaseOrder.date)}
              {/* **DULY_CONVENED_MEETING** */}
            </Text>
          </Text>

          {/* Clauses */}
          <View style={{ marginTop: 27, position: 'relative', right: 14, marginLeft: 'auto', marginRight: 'auto', width: '70%', textAlign: 'left', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 13 }}>
              <Text style={{ fontWeight: 'bold' }}>Whereas (Purpose):</Text> {purchaseOrder.taxAmount}
            </Text>
            <Text style={{ fontSize: 13, marginTop: 22 }}>
              <Text style={{ fontWeight: 'bold' }}>Whereas (Background):</Text> {purchaseOrder.status}
            </Text>

            {/* Signatures */}
            <View style={{ marginTop: 26 }}>
              <Text style={{ fontSize: 11 }}>
                <Text style={{ textDecoration: 'underline' }}>Quorum Required:</Text> {purchaseOrder.vendor.payableTo}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 50, marginHorizontal: 'auto' }}>
              {purchaseOrder.lineItems.map((item, index) => {
                    return (
                      <View
                        key={item.uuid}
                        style={{
                          width: '48%',
                          alignItems: 'center',
                          marginBottom: 22,
                        }}
                      >
                        {/* 🔹 DocuSign anchor string: one for each participant */}
                        <View style={{ height: 32, marginBottom: 0 }}>
                          <Text style={{ fontSize: 10.5, color: 'white' }}>
                            {`**SIGN_HERE_${index + 1}**`}
                          </Text>
                        </View>

                        <View style={{ width: '100%', height: 12, borderBottom: '1px solid black' }} />
                        <Text style={{ fontSize: 10.5, marginTop: 3, textAlign: 'center' }}>
                          <Text style={{ fontWeight: 'bold' }}>{item.lineTotal}</Text>{' '}
                          {item.itemId} {item.description}
                        </Text>
                      </View>
                    );
                  })}
              </View>
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
  );
};

export function convertISODateToReadableEnglish(dateInput: Date) {
    if (!dateInput) return "Unknown Date";

    let parsedDate;

    // 🔹 Ensure dateInput is correctly parsed
    if (typeof dateInput === "string") {
        parsedDate = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        parsedDate = dateInput;
    } else {
        console.error("❌ Invalid date format:", dateInput);
        return "Invalid Date";
    }

    // 🔹 Format the date as "February 2, 2025"
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC" // Ensures no timezone shift
    }).format(parsedDate);
}

export function convertISODateToReadableEnglishTime(dateInput: string | Date) {
    if (!dateInput) return "Unknown Date";

    let parsedDate;

    // 🔹 Ensure dateInput is correctly parsed
    if (typeof dateInput === "string") {
        parsedDate = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        parsedDate = dateInput;
    } else {
        console.error("❌ Invalid date format:", dateInput);
        return "Invalid Date";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: false, // 24-hour format
        timeZone: "UTC"
    }).format(parsedDate);
}