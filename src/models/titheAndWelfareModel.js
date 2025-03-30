import mongoose from "mongoose";

const titheAndWelfareSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDetails',
        required: true,
    },
    userFullName:{
        type: String,
        required: true,
    },
    fullName:{
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    category:{
        type: String,
        enum: ['Tithe', 'Welfare'],
        default: 'Tithe',
        required: true,
    },
    dateCreated:{
        type: String,
        default: ()=> new Date().toISOString()
    },
},{
    timestamps: true
});

export  const titheAndWelfare = mongoose.model('titheAndWelfare', titheAndWelfareSchema);