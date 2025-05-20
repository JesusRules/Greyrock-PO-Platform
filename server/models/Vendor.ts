import mongoose, { Schema, Document } from "mongoose";

export const vendorSchema = new mongoose.Schema({ 
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    payableTo: { type: String, required: true }, // NEW
    email: { 
        type: String, 
        required: true,
        match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please enter a valid email address'
        ]
    },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    comment: { type: String, required: false },
 }, {
    timestamps: true,
 })

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
 export default Vendor;