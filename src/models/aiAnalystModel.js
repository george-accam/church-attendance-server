import mongoose from "mongoose";

const aiAnalystSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    session:[{
        prompt: {
            type: String,
            required: true,
        },
        response: {
            type: String,
            required: true,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const AiAnalyst = mongoose.model('AiAnalyst', aiAnalystSchema);
export default AiAnalyst;