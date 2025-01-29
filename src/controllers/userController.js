import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/middlewareToken.js";


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
        if (email.endsWith("@admin.com")) {
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
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: savedUSer
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
            res.status(404).json({ success: false, message: "password is invalid" });
        }

        //generate token for the user
        const token = generateToken(userExist);
        res.status(200).json({ success: true, message: "login successfully", user: userExist, token: token });

    } catch (error) {
        res.status(500).json({  success: false, message: `Internal server error: ${error.message}`});
    }
};

//get all users controller
export const getAllUsers = async(req, res) =>{
    try {
        const getUsers = await User.find().select("-__v -password");

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
