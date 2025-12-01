import { Department } from "./Department.js";
import { User } from "./User.js";
import { Vendor } from "./Vendor.js";

export interface LineItem {
  quantity: number;
  itemId: string;
  description: string;
  unitPrice: number;
  lineTotal: number;
  uuid: string;
}

// One signature “slot” for a given role
export interface SignatureRole {
  signedImg: string | null;        // Cloudinary URL or null
  signedBy: User | string | null;  // populated User or ObjectId string
  signedAt?: string | null;        // ISO date string (optional)
}

// All 4 roles on the PO
export interface PurchaseOrderSignatures {
  submitter: SignatureRole;
  manager: SignatureRole;
  generalManager: SignatureRole;
  financeDepartment: SignatureRole;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  date: Date;
  paymentMethod: string;
  department: Department;
  vendor: Vendor;
  companyInfo: {
    name: string;
    address: string;
    financeContact: string;
    phone: string;
    invoiceEmail: string;
  };
  lineItems: LineItem[];
  shipping: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;

  // User who created/submitted the PO
  // submitter: User | string;
  // 🔥 New signatures block
  signatures: PurchaseOrderSignatures;
  cancelled?: boolean;
  // (Optional) keep these only if you still use them somewhere,
  // otherwise you can safely delete them from this interface.
  // signedBy?: User | string;
  // signedImg?: string | null;
  status: "Pending" | "Signed" | "Rejected" | "Approved";
  pdfUrl?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// import { Department } from "./Department.js";
// import { User } from "./User.js";
// import { Vendor } from "./Vendor.js";

// export interface LineItem {
//   quantity: number;
//   itemId: string;
//   description: string;
//   unitPrice: number;
//   lineTotal: number;
//   uuid: string;
// }

// export interface PurchaseOrder {
//   _id: string;
//   poNumber: string;
//   date: Date;
//   paymentMethod: string;
//   department: Department;
//   // vendor: {
//   //   name: string;
//   //   contactName: string;
//   //   phone: string;
//   //   email: string;
//   //   payableTo: string;
//   // };
//   vendor: Vendor
//   companyInfo: {
//     name: string;
//     address: string;
//     financeContact: string;
//     phone: string;
//     invoiceEmail: string;
//   };
//   lineItems: LineItem[];
//   shipping: number;
//   taxRate: number;
//   subtotal: number;
//   taxAmount: number;
//   total: number;
//   submitter: User | string;
//   signedBy: User | string;
//   // manager: string;
//   signedImg: string | null;
//   status: string;
//   pdfUrl?: string;
//   createdAt: string;
//   updatedAt: string;
// }