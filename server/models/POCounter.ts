// models/purchaseOrderCounter.model.ts
import mongoose from 'mongoose';

const PurchaseOrderCounterSchema = new mongoose.Schema({
  department: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

export default mongoose.models.PurchaseOrderCounter ||
  mongoose.model('PurchaseOrderCounter', PurchaseOrderCounterSchema);
