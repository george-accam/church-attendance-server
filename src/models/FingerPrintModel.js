import mongoose from "mongoose";

const FingerPrintSchema = new mongoose.Schema({
    fingerprintID: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const FingerPrintModel = mongoose.model("FingerPrint", FingerPrintSchema);
export default FingerPrintModel;