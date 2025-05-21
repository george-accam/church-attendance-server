import { Attendance, AttendeesCheck, PersonalAttendance } from "../models/attendanceModel.js";
import FingerPrintModel from "../models/FingerPrintModel.js";

// collect fingerprint
export const collectFingerPrint = async (req, res) => {
    const { fingerprintID } = req.body;
    try {

        // delete existing fingerprint
        await FingerPrintModel.deleteMany({ fingerprintID });

        //create new fingerprint
        const newFingerPrint = new FingerPrintModel({ fingerprintID });
        if (!newFingerPrint) {
            return res.status(404).json({ message: "fingerprint required are required" });
        }
        //save fingerprint
        const savedFingerPrint = await newFingerPrint.save();
        res.status(201).json({ 
            success: true, 
            message: "fingerprint registered successfully", 
            fingerprint: savedFingerPrint 
        });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}

export const getFingerPrint = async (req, res) => {
    try {
        const fingerprint = await FingerPrintModel.find().select("-__v").sort({ createdAt: -1 });
        if (!fingerprint) {
            return res.status(404).json({ message: "No fingerprint found" });
        }
        res.status(200).json({
            success: true,
            message: "fingerprint retrieved successfully",
            fingerprint: fingerprint 
        });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}

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
            attendeePhoneNumber: savedAttendance.phoneNumber,
            checkedBy: savedAttendance.userFullName, 
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
        const personalAttendance = await PersonalAttendance.find({ userId }).select("-__v").sort({ createdAt: -1 });
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

// update the personal attendance of a user
export const updatePersonalAttendance = async (req, res) => {
    const { id } = req.params;
    const { userId, attendeeName, attendeePhoneNumber } = req.body;
    try {
        const personalAttendance = await PersonalAttendance.findByIdAndUpdate( id, { userId, attendeeName, attendeePhoneNumber }, { new: true } );
        if (!personalAttendance) {
        return res.status(404).json({ message: "member not found" });
        }
        
        if (personalAttendance.attendeePhoneNumber.length !== 10) {
            return res.status(400).json({ message: "Phone number must be 10 digits" });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "member updated successfully",
            personalAttendance: personalAttendance
        });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}

// delete personal attendance by id
export const deletePersonalAttendance = async (req, res) =>{
    const { id } = req.params;
    try {
        const personalAttendance = await PersonalAttendance.findByIdAndDelete(id);
        if(!personalAttendance){
            res.status(404).json({ success: false, message: "member not found" });
        }
        res.status(200).json({
                success: true,
                message: "member deleted successfully"
            });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}

//check in attendee
export const checkInAttendee = async (req, res) => {
    const { phoneNumber, checkedBy } = req.body;
    try {
        //check if attendee exist
        const attendeeExist = await Attendance.findOne({ phoneNumber });
        if (!attendeeExist) {
            return res.status(404).json({ message: "member does not exist, please register first" });
        }

        // Find the most recent check-in for the user
        const lastCheckIn = await AttendeesCheck.findOne({ userId: attendeeExist._id }).sort({ checkInTime: -1 });

        // Check if 12 hours have passed since the last check-in
        const twelveHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
        if (lastCheckIn && lastCheckIn.checkInTime > twelveHoursAgo) {
            return res.status(400).json({ message: "you can only check in once" });
        }

        //create new check in
        const newCheckIn = new AttendeesCheck({ 
            userId: attendeeExist._id,
            attendeeFullName: attendeeExist.fullName,
            attendeePhoneNumber: attendeeExist.phoneNumber,
            checkedBy: checkedBy,
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
        const attendance = await Attendance.find().select("-__v").sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: "Attendance retrieved successfully", attendance: attendance });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}

//get attendee by id  
export const getAttendeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const attendee = await Attendance.findById(id).select("-__v").sort({ createdAt: -1 });
        if (!attendee) {
            return res.status(404).json({ message: "member not found" });
        }
        res.status(200).json({ success: true, message: "member retrieved successfully", attendee: attendee });

    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

// Get all attendees check-ins with daily and monthly breakdowns
export const getAllAttendeesCheckIns = async (req, res) => {
    try {
        const allCheckIns = await AttendeesCheck.find({}).select("-__v").sort({ checkInTime: -1 });

        if(!allCheckIns || allCheckIns.length === 0) {
            return res.status(404).json({ success: false, message: "No check-ins found" });
        }

        // Organize data by date and calculate monthly totals
        const dataByDate = {};
        const checkInsByMonth = {};
        const memberCountByMonth = new Set();
        const uniqueMembersByMonth = {};

        allCheckIns.forEach((item) => {
            const checkInDate = new Date(item.checkInTime);
            const dateKey = checkInDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const monthYearKey = `${checkInDate.getFullYear()}-${(checkInDate.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
            
            // Organize by date
            if (!dataByDate[dateKey]) {
                dataByDate[dateKey] = [];
            }
            dataByDate[dateKey].push(item);

            // Count total check-ins by month
            if (!checkInsByMonth[monthYearKey]) {
                checkInsByMonth[monthYearKey] = 0;
            }
            checkInsByMonth[monthYearKey]++;

            // Track unique members by month
            if (!uniqueMembersByMonth[monthYearKey]) {
                uniqueMembersByMonth[monthYearKey] = new Set();
            }
            if (item.memberId) {
                uniqueMembersByMonth[monthYearKey].add(item.memberId.toString());
            }
        });

        // Convert monthly data to a more usable format
        const monthlyStats = Object.keys(checkInsByMonth).map(monthKey => {
            return {
                month: monthKey,
                formattedMonth: new Date(`${monthKey}-01`).toLocaleString('default', { month: 'long', year: 'numeric' }),
                totalCheckIns: checkInsByMonth[monthKey],
                uniqueMembers: uniqueMembersByMonth[monthKey]?.size || 0
            };
        }).sort((a, b) => new Date(`${a.month}-01`) - new Date(`${b.month}-01`));

        res.status(200).json({ 
            success: true, 
            message: "Check-ins retrieved successfully", 
            totalCheckIns: allCheckIns,
            checkIns: dataByDate,
            monthlyStats: monthlyStats,
            checkInsByMonth: checkInsByMonth,
            uniqueMembersByMonth: Object.fromEntries(
                Object.entries(uniqueMembersByMonth).map(([key, set]) => [key, set.size])
            )
        });
    } 
    catch (error) {
        res.status(500).json({ 
            success: false, 
            message: `Internal server error: ${error.message}`,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// search for checked in attendee
export const searchCheckedInAttendee = async (req, res) => {
    const query = req.query.q || "";
    try {
        const searchedAttendee = await AttendeesCheck.find({ 
            $or: [
                {attendeeFullName: {$regex: query, $options: "i"}},
                {attendeePhoneNumber: {$regex: query, $options: "i"}},
                {checkInTime: {$regex: query, $options: "i"}}
            ] 
        }).select("-__v").sort({ checkInTime: -1 }).maxTimeMS(15000); ;

        // Organize data by date
        const dataByDate = searchedAttendee.reduce((acc, item) => {
            const dateKey = new Date(item.checkInTime).toISOString().split('T')[0];
            if (!acc[dateKey]) {
            acc[dateKey] = [];
            }
            acc[dateKey].push(item);
            return acc;
            }, {});
        
        if (!searchedAttendee) {
            res.status(404).json({ success: false, message: "member not found" });
        }
        res.status(200).json({ 
            success: true, 
            message: "member searched successfully", 
            attendee: searchedAttendee,
            totalCheckIns: searchedAttendee.length,
            checkIns: dataByDate
        });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: `Internal server error ${error.message}` });
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
