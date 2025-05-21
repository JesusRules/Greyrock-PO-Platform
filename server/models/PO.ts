import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const LineItemSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4 },
  quantity: { type: Number, required: false },
  itemId: { type: String, required: false },
  description: { type: String, required: false },
  unitPrice: { type: Number, required: false },
  lineTotal: { type: Number, required: false },
}, { _id: false });

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true }, // e.g. "GREADM" or "PO-2023-0001"
  date: { type: Date, required: true },
  paymentMethod: { type: String, required: true }, // e.g. "Cheque"

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  // vendor: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Vendor",
  //   required: true,
  // },
  vendor: {
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    payableTo: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String },
  },
  // Company details (right side static block in PDF)
  companyInfo: {
    name: { type: String, default: 'Grey Rock Entertainment Center Inc.' },
    address: { type: String, default: '100 Chief Joanna Blvd, Madawaska Maliseet First Nation, NB, E7C 0C1' },
    financeContact: { type: String, default: 'Emily-Rose Robinson' },
    phone: { type: String, default: '506-735-2838' },
    invoiceEmail: { type: String, default: 'Finance@GreyRock-Casino.com' },
  },
  lineItems: [LineItemSchema],
  // Financial fields
  shipping: { type: Number, required: true },
  taxRate: { type: Number, required: true }, // e.g. 15
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  total: { type: Number, required: true },
  // Signatures
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // manager: { type: String, required: true },

  status: {
    type: String,
    enum: ['Pending', 'Signed', 'Rejected', 'Approved'],
    default: 'Pending',
  },
  signedImg: { type: String, default: null, required: false }, // Stores Base64
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  pdfUrl: { type: String }, // Optional if generated and uploaded

}, {
  timestamps: true,
});

const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema);
  export default PurchaseOrder;