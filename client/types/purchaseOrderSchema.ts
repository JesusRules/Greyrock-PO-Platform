import { z } from "zod";

const purchaseOrderSchema = z.object({
  department: z.string().min(1, "Department is required"),
  // poNumber: z.string().min(1, "PO Number is required"),
  // date: z.date(),
  vendor: z.string().min(1, "Vendor is required"),
  contactName: z.string().min(1, "Contact Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  payableTo: z.string().min(1, "Payable To is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  submitter: z.string().min(1, "Submitter is required"),
  comments: z.string().max(1000).optional().or(z.literal("")),
});

export default purchaseOrderSchema