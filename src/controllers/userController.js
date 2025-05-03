import User from "../models/userModel.js";
import { Attendance } from "../models/attendanceModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/middlewareToken.js";
import { UserVerificationCode } from "../models/userVerificationCode.js";
import { sendMail } from "../utils/sendMail.js";


// generate a random verification code
const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 6-digit code
    return code;
}


//the register controllers
export const registerUser = async (req, res) => {
    const { fullName, email, phoneNumber, password, confirmPassword } = req.body;
    try {
        //check if the user already exists
        const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (userExists) {
            return res.status(404).json({
                success: false,
                message: "User already exists"
            });
            
        }
        //check if the password and confirm password are the same
        if (password !== confirmPassword) {
            return res.status(400).json({message: "Password does not match try again"});
        }
        //hash the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // set the user role
        let role = "Usher";
        if (email.endsWith(".super@gmail.com")) {
            role = "Admin";
        }

        const userData = { fullName, email, phoneNumber, password: hashedPassword, role };
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "Please fill all fields"
            });
        }
        const user = new User(userData);
        const savedUSer = await user.save();

        // added to the attendance
        const attendance = new Attendance({ 
                userId: user._id, 
                userFullName: user.fullName, 
                fullName: user.fullName, 
                phoneNumber: user.phoneNumber 
            });
        const savedAttendance = await attendance.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: savedUSer,
            attendance: savedAttendance
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            errorMessage: error.message
        });
        
    }
};

//login controllers
export const userLogin = async(req, res)=>{
    const { email, phoneNumber, password } = req.body;
    try {
        const userExist = await User.findOne({ $or: [{email}, {phoneNumber}]});
        if (!userExist) {
            res.status(404).json({ success: false, message: "user not found" });
        }

        //check if the password is valid
        const isValidPassword = await bcrypt.compare(password, userExist.password);
        if (!isValidPassword) {
            res.status(404).json({ success: false, message: "user credential is invalid" });
        }

        if(userExist.role === "Admin"){
            //generate a verification code for the user
            const verificationCode = generateVerificationCode();
            const htmlContent = `
                <h1>Welcome to Christ Embassy Kasoa Branch 2</h1>
                <p>Dear <strong>${userExist.fullName}</strong>,</p>
                <p>Thank you for logging in. Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire after <strong>10 minutes</strong></p>
            `;
            const email = userExist.email;
            const sentEmail = await sendMail(email, htmlContent);
            console.log("Email sent successfully:", sentEmail.messageId);
            
            //delete the previous verification code
            await UserVerificationCode.deleteOne({ userId: userExist._id });

            //save the verification code to the database
            const userVerificationCode = new UserVerificationCode({
                userId: userExist._id,
                verificationCode: verificationCode
            });
            
            await userVerificationCode.save();
            return res.status(200).json({
                success: true,
                message: "login successfully",
                user: userExist,
                token: generateToken(userExist),
            })
        }

        //generate token for the user
        const token = generateToken(userExist);
        res.status(200).json({ 
            success: true, 
            message: "login successfully", 
            user: userExist, 
            token: token 
        });

    } catch (error) {
        res.status(500).json({  success: false, message: `Internal server error: ${error.message}`});
    }
};

//get all users controller
export const getAllUsers = async(req, res) =>{
    try {
        const getUsers = await User.find().select("-__v -password").sort({ createdAt: -1 });

        //if the users all not found
        if(!getUsers){
            res.status(404).json({ success: false, message: "users not found" });
        }

        res.status(200).json({ success: true, message: "users fetch successfully", allUsers: getUsers});

    } catch (error) {
        res.json({ success: false, message: `Internal server error: ${error.message}`});
    }
};


//get user by id controller
export const getUserById = async(req, res) =>{
    const user = req.user.id;
    try {
        const getUser = await User.findById(user).select("-__v -password");

        //if the user not found
        if(!getUser){
            res.status(404).json({ success: false, message: "user not found" });
        }

        res.status(200).json({ success: true, message: "user fetch successfully", allUsers: getUser});

    } catch (error) {
        res.json({ success: false, message: `Internal server error: ${error.message}`});
    }
};

//update user controller
export const  updateUser = async(req, res) =>{
    const { id } = req.params;
    const { fullName } = req.body;
    try {
        const userUpdate = await User.findByIdAndUpdate(id, { fullName }, { new: true });
        if(!userUpdate){
            res.status(404).json({ success: false, message: "user not found" });
        }
        res.status(200).json({ success: true, message: "user updated successfully", user: userUpdate});
        
    } catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}`});
    }
};

//delete user controller
export const deleteUser = async(req, res) =>{
    const { id } = req.params;
    try {
        const userDelete = await User.findByIdAndDelete(id);
        if(!userDelete){
            res.status(404).json({ success: false, message: "user not found" });
        }
        res.status(200).json({ success: true, message: "user deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};

// search user controller
export const searchUser = async(req, res)=>{
    const query = req.query.q || "";

    try {
        const searchUser = await User.find({ $or: [{ fullName: { $regex: query, $options: "i" } }, { phoneNumber: { $regex: query, $options: "i" } }] });
        if(!searchUser){
            res.status(404).json({ success: false, message: "user not found" });
        }
        if (query === "") {
            return res.status(404).json({ message: "No member found" });
        }
        res.status(200).json({ success: true, message: "user searched successfully", allUsers: searchUser });
            
    } 
    catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
}

// verify user controller
export const verifyUser = async (req, res) => {
    const { userId, verificationCode } = req.body;
    try {
        // Check if the verification code exists for the user
        const verificationEntry = await UserVerificationCode.findOne({ userId, verificationCode });
        if (!verificationEntry) {
            return res.status(400).json({ success: false, message: "Invalid verification code" });
        }

        // If valid, delete the verification entry and proceed with login
        await UserVerificationCode.deleteOne({ userId, verificationCode });

        res.status(200).json({ success: true, message: "User verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
}

// send verification code controller
export const sendVerificationCode = async (req, res) => {
    const { userId } = req.body;
    try {
        const userExist = await User.findById(userId);
        if (!userExist) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate a new verification code
        const verificationCode = generateVerificationCode();
        const htmlContent = `
            <h1>Welcome to Christ Embassy Kasoa Branch 2</h1>
            <p>Dear <strong>${userExist.fullName}</strong>,</p>
            <p>Your new verification code is: <strong>${verificationCode}</strong></p>
            <p>This code will expire after <strong>10 minutes</strong></p>
        `;
        const email = userExist.email;
        const sentEmail = await sendMail(email, htmlContent);
        console.log("Email sent successfully:", sentEmail.messageId);
        
        // Delete the previous verification code
        await UserVerificationCode.deleteOne({ userId });

        // Save the new verification code to the database
        const userVerificationCode = new UserVerificationCode({
            userId,
            verificationCode
        });
        
        await userVerificationCode.save();
        res.status(200).json({ success: true, message: "Verification code sent successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
}