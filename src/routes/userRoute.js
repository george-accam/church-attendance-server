import { Router } from "express";
import { verifyToken } from "../middleware/middlewareToken.js";
import { registerUser, userLogin, getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", userLogin);
router.get("/users", getAllUsers);
router.get("/user-id", verifyToken, getUserById);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);

export default router;