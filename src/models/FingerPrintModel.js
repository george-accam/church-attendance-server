import mongoose from "mongoose";

const FingerPrintSchema = new mongoose.Schema({
    fingerprintID: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    expires: "10m", // Document expires after 10 minute
    index: true // Create an index for the expiration
});
const FingerPrintModel = mongoose.model("FingerPrint", FingerPrintSchema);
export default FingerPrintModel;