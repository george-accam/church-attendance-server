import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum :['usher', 'admin'],
        default: 'usher',
    },
}, { 
    timestamps: true 
});

const User = mongoose.model('userDetails', userSchema);
export default User;