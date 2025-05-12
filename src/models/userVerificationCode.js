import mongoose from "mongoose";

const userVerificationCodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    verificationCode: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "10m", // Code expires after 5 minutes
        index: true // Create an index for the expiration
    }
});

export const UserVerificationCode = mongoose.model("UserVerificationCode", userVerificationCodeSchema);