import { Router } from "express";
import { 
    createAttendance, 
    checkInAttendee, 
    getAttendance, 
    getAttendeeById, 
    getAttendeeCheckIn,
    updateAttendance,
    deleteAttendance,
    getPersonalAttendance, 
    searchAttendee,
    searchPersonalAttendance,
    updatePersonalAttendance,
    deletePersonalAttendance,
    getAllAttendeesCheckIns,
    searchCheckedInAttendee,
} from "../controllers/attendancecontroller.js";

const router = Router();

router.post("/attendee", createAttendance); // create attendance
router.post("/check-in", checkInAttendee); // check in attendance
router.get("/search-attendee", searchAttendee); // search attendee
router.get("/search-personal-attendance/:userId", searchPersonalAttendance); // search personal attendance
router.get("/attendees", getAttendance); // get all attendance
router.get("/personal-attendee/:userId", getPersonalAttendance); // get personal attendance by id
router.get("/attendee/:id", getAttendeeById); // get attendance by id
router.get("/check-in/:phoneNumber", getAttendeeCheckIn); // get number of attendance by phone number
router.get("/all-check-ins", getAllAttendeesCheckIns) // get all check ins
router.get("/search-checked-in-attendee",searchCheckedInAttendee)
router.put("/update-personal-attendee/:id", updatePersonalAttendance); // update personal attendance
router.put("/update-attendance/:id", updateAttendance); // update attendance by id
router.delete("/delete-personal-attendee/:id", deletePersonalAttendance); // delete personal attendance
router.delete("/delete-attendance/:id", deleteAttendance); // delete attendance by id

export default router;