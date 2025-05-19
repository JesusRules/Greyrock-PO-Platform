import mongoose from "mongoose";

const loginRecordSchema = new mongoose.Schema({ 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    loggedDate: { type: Date, required: true },
 });

const LoginRecord = mongoose.models.LoginRecord || mongoose.model('LoginRecord', loginRecordSchema);
 export default LoginRecord;