import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  itemId: { type: String, required: true },
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
}, { _id: false });

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true }, // e.g. "GREADM" or "PO-2023-0001"
  date: { type: Date, required: true },
  paymentMethod: { type: String, required: true }, // e.g. "Cheque"

  department: { type: String, required: true }, // ADMINISTRATION, OPERATIONS, etc.

  // Vendor section (left side of form)
  vendor: {
    name: { type: String, required: true },
    contactName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    payableTo: { type: String, required: true },
  },

  // Company details (right side static block in PDF)
  companyInfo: {
    name: { type: String, default: 'Grey Rock Entertainment Center Inc.' },
    address: { type: String, default: '100 Chief Joanna Blvd, Madawaska Maliseet First Nation, NB, E7C 0C1' },
    financeContact: { type: String, default: 'Emily-Rose Robinson' },
    phone: { type: String, default: '506-735-2838' },
    invoiceEmail: { type: String, default: 'Finance@GreyRock-Casino.com' },
  },

  orderItems: [OrderItemSchema],

  // Financial fields
  shipping: { type: Number, required: true },
  taxRate: { type: Number, required: true }, // e.g. 15
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  total: { type: Number, required: true },

  // Signatures
  submitter: { type: String, required: true },
  manager: { type: String, required: true },

  status: {
    type: String,
    enum: ['Pending', 'Signed', 'Rejected'],
    default: 'Pending',
  },

  pdfUrl: { type: String }, // Optional if generated and uploaded

}, {
  timestamps: true,
});

export default mongoose.models.PurchaseOrder ||
  mongoose.model('PurchaseOrder', PurchaseOrderSchema);
