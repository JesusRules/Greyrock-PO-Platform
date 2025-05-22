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

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  date: Date;
  paymentMethod: string;
  department: Department;
  // vendor: {
  //   name: string;
  //   contactName: string;
  //   phone: string;
  //   email: string;
  //   payableTo: string;
  // };
  vendor: Vendor
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
  submitter: User | string;
  signedBy: User | string;
  // manager: string;
  signedImg: string | null;
  status: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}