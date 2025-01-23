import { Attendance, AttendeesCheck } from "../models/attendanceModel.js";

//create attendance
export const createAttendance = async (req, res) => {
    const { fullName, phoneNumber } = req.body;
    try {
        //check if attendee already exist
        const attendeeExist = await Attendance.findOne({ phoneNumber });
        if (attendeeExist) {
            return res.status(404).json({ message: "member already exist" });
        }

        //create new attendance
        const newAttendance = new Attendance({fullName, phoneNumber});
        if (!newAttendance) {
            return res.status(404).json({ message: "All fields are required" });
        }

        //check if phone number is 10 digits
        if (newAttendance.phoneNumber.length !== 10) {
            return res.status(404).json({ message: "Phone number must be 10 digits" });
        }
        //save attendance
        const savedAttendance = await newAttendance.save();

        //create new check in
        const checkIn = new AttendeesCheck({ userId: savedAttendance._id });
        res.status(201).json({ success: true, message: "member created successfully", attendee: savedAttendance, checkIn: checkIn });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

//check in attendee
export const checkInAttendee = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        //check if attendee exist
        const attendeeExist = await Attendance.findOne({ phoneNumber });
        if (!attendeeExist) {
            return res.status(404).json({ message: "member does not exist, please register first" });
        }

        // Find the most recent check-in for the user
        const lastCheckIn = await AttendeesCheck.findOne({ userId: attendeeExist._id }).sort({ checkInTime: -1 });

        // Check if 12 hours have passed since the last check-in
        const twelveHoursAgo = new Date(Date.now() - 2 * 60 * 1000); // 12 hours in milliseconds
        if (lastCheckIn && lastCheckIn.checkInTime > twelveHoursAgo) {
            return res.status(400).json({ message: "You can only check in once every 12 hours" });
        }

        //create new check in
        const newCheckIn = new AttendeesCheck({ userId: attendeeExist._id });
        if (!newCheckIn) {
            return res.status(404).json({ message: "All fields are required" });
        }

        //save check in
        const savedCheckIn = await newCheckIn.save();
        res.status(201).json({ success: true, message: "member checked in successfully", checkIn: savedCheckIn });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

//get all attendance
export const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find().select("-__v");
        res.status(200).json({ success: true, message: "Attendance retrieved successfully", attendance: attendance });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}

//get attendee by id
export const getAttendeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const attendee = await Attendance.findById(id).select("-__v");
        if (!attendee) {
            return res.status(404).json({ message: "member not found" });
        }
        res.status(200).json({ success: true, message: "member retrieved successfully", attendee: attendee });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

//get number of attendance by phone number
export const getAttendeeCheckIn = async (req, res) => {
    const { phoneNumber } = req.params;
    try {
        //check if attendee exist
        const attendeeExist = await Attendance.findOne({ phoneNumber });
        if (!attendeeExist) {
            return res.status(404).json({ message: "member does not exist, please register first" });
        }

        //get number of check in
        const count = await AttendeesCheck.countDocuments({ userId: attendeeExist._id });
        res.status(200).json({ success: true, message: "member attendance retrieved successfully", numberOfAttendance: count });

        
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

//update attendance
export const updateAttendance = async (req, res) => {
    const { id } = req.params;
    const { fullName, phoneNumber } = req.body;
    try {
        //check if phone number is 10 digits
        if (phoneNumber.length !== 10) {
            return res.status(404).json({ message: "Phone number must be 10 digits" });
        }

        //check if attendee exist
        const updatedAttendance = await Attendance.findByIdAndUpdate(id, { fullName, phoneNumber }, { new: true });
        if (!updatedAttendance) {
            return res.status(404).json({ message: "member not found" });
        }
        res.status(200).json({ success: true, message: "member updated successfully", updatedAttendance: updatedAttendance });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

//delete an attendee
export const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    try {
        //check if attendee exist
        const deletedAttendance = await Attendance.findByIdAndDelete(id);
        if (!deletedAttendance) {
            return res.status(404).json({ message: "member not found" });
        }
        res.status(200).json({ success: true, message: "member deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};
