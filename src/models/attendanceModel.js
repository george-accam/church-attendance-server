import mongoose from "mongoose";
import { type } from "os";

// Define the schema for the attendance model
const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userDetails",
        required: true
    },
    userFullName: {
        type: String,
        ref: "userDetails",
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }
}, { 
    timestamps: true 
});
export const Attendance = mongoose.model("Attendance", attendanceSchema);

//attendees schema for number of attendance
const attendeesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
        required: true
    },
    attendeeFullName: {
        type: String,
        required: true
    },
    attendeePhoneNumber: {
        type: String,
        required: true
    },
    checkInTime: {
        type: String,
        default: ()=> new Date().toISOString()
    },
    checkedBy: {
        type: String,
        required: true
    },
});
export const AttendeesCheck = mongoose.model("AttendeesCheck", attendeesSchema);

// personal attendance schema
const personalAttendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userDetails",
        required: true
    },
    attendeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
        required: true
    },
    attendeeName: {
        type: String,
        required: true
    },
    attendeePhoneNumber: {
        type: String,
        required: true
    },
}, { 
    timestamps: true
});
export const PersonalAttendance = mongoose.model("PersonalAttendance", personalAttendanceSchema);