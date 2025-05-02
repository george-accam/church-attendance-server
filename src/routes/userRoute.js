import { Router } from "express";
import { verifyToken } from "../middleware/middlewareToken.js";
import { limiter } from "../middleware/Limiter.js";
import { registerUser, userLogin, getAllUsers, getUserById, updateUser, deleteUser, searchUser, verifyUser, sendVerificationCode } from "../controllers/userController.js";

const router = Router();

// router.use(limiter);

router.post("/login", limiter, userLogin); // login user
router.post("/verify-user", verifyUser); // verify user
router.post("/send-verification-code", sendVerificationCode); // send verification code
router.post("/register", registerUser); // register user
router.get("/users", getAllUsers); // get all users
router.get("/search-users", searchUser); // search user
router.get("/user-id", verifyToken, getUserById); // get user by id
router.put("/update-user/:id", updateUser); // update user
router.delete("/delete-user/:id", deleteUser); // delete user

export default router;