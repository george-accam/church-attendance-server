import { Attendance, AttendeesCheck, PersonalAttendance } from "../models/attendanceModel.js";

//register attendance
export const createAttendance = async (req, res) => {
    const { userId, userFullName, fullName, phoneNumber } = req.body;
    try {
        //check if attendee already exist
        const attendeeExist = await Attendance.findOne({ phoneNumber });
        if (attendeeExist) {
            return res.status(404).json({ message: "member already exist" });
        }

        //create new attendance
        const newAttendance = new Attendance({ 
            userId, 
            userFullName, 
            fullName, 
            phoneNumber 
        });
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
        const checkIn = new AttendeesCheck({ 
            userId: savedAttendance._id,
            attendeeFullName: savedAttendance.fullName,
            attendeePhoneNumber: savedAttendance.phoneNumber 
        });
        // save check in
        const newCheckIn = await checkIn.save();

        // create personal attendance
        const personalAttendance = new PersonalAttendance({
            userId: userId,
            attendeeId: savedAttendance._id,
            attendeeName: savedAttendance.fullName,
            attendeePhoneNumber: savedAttendance.phoneNumber,
        });
        // save personal attendance
        const savedPersonalAttendance = await personalAttendance.save();

        res.status(201).json({ 
            success: true, 
            message: "member registered and checked in successfully", 
            attendee: savedAttendance, 
            savedPersonalAttendance : savedPersonalAttendance, 
            checkIn: newCheckIn 
        });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

// search for an attendee   
export const searchAttendee = async (req, res) => {
    const query = req.query.q || "";
    try {
        const attendee = await Attendance.find({ 
            $or: [ 
                { phoneNumber: { $regex: query, $options: "i" } }, 
                { fullName: { $regex: query, $options: "i" } } 
            ]
        }).select("-__v");
        
        if (!attendee) {
            return res.status(404).json({ message: "member not found" });
        }
        if (query === "") {
            return res.status(404).json({ message: "No member found" });
        }
        res.status(200).json({ success: true, message: "member retrieved successfully", attendee: attendee });
        
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

// search the personal attendance of a user
export const searchPersonalAttendance = async (req, res) => {
    const query = req.query.q || "";
    const { userId } = req.params;
    try {
        const personalAttendance = await PersonalAttendance.find({
            userId,
            $or: [
                { attendeePhoneNumber: { $regex: query, $options: "i" } },
                { attendeeName: { $regex: query, $options: "i" } },
            ],
        }).select("-__v");
        if (!userId) {
            return res.status(404).json({ message: "user id not found" });
        };
        if (!personalAttendance) {
            return res.status(404).json({ message: "member not found" });
        }
        if (query === "") {
            return res.status(404).json({ message: "No member found" });
        }
        res.status(200).json({ success: true, message: "member retrieved successfully", personalAttendance: personalAttendance });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

// get the personal attendance of a user
export const getPersonalAttendance = async (req, res) => {
    const { userId } = req.params;
    try {
        const personalAttendance = await PersonalAttendance.find({ userId }).select("-__v");
        if(!personalAttendance){
            res.status(404).json({ success: false, message: "user not found"});
        }
        res.status(200).json({ 
            success: true, 
            message: "Personal Attendance retrieved successfully", 
            personalAttendance: personalAttendance 
        });
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

        // Check if 2 minutes have passed since the last check-in
        const twelveHoursAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (lastCheckIn && lastCheckIn.checkInTime > twelveHoursAgo) {
            return res.status(400).json({ message: "You can only check in once every 2 minutes" });
        }

        //create new check in
        const newCheckIn = new AttendeesCheck({ 
            userId: attendeeExist._id,
            attendeeName: attendeeExist.fullName,
            attendeePhoneNumber: attendeeExist.phoneNumber
        });
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
