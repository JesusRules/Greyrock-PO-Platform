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
  date: string;
  department: string;
  paymentMethod: string;
  vendor: {
    name: string;
    contactName: string;
    phone: string;
    email: string;
    payableTo: string;
  };
  companyInfo: {
    name: string;
    address: string;
    financeContact: string;
    phone: string;
    invoiceEmail: string;
  };
  orderItems: OrderItem[];
  shipping: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  submitter: string;
  manager: string;
  status: "Pending" | "Signed" | "Rejected" | "Approved";
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}