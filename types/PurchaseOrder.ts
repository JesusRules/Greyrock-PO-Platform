import { Department } from "./Department";
import { User } from "./User";
import { Vendor } from "./Vendor";

export interface OrderItem {
  quantity: number;
  itemId: string;
  description: string;
  unitPrice: number;
  lineTotal: number;
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
  lineItems: OrderItem[];
  shipping: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  submitter: User | string;
  // manager: string;
  signedImg: string | null;
  status: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}