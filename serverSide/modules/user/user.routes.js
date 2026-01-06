import express from "express";
const router = express.Router();
import {
  signup,
  login,
  resetPassword,
  logout,
  singleUser,
} from "./users.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/rbac.middleware.js";

//signup
router.post("/signup", signup);

//login
router.post("/login", login);

//reset password
router.put("/reset-password", verifyToken, resetPassword);

//logout
router.get("/logout", verifyToken, logout);

//get a user by id
router.get("/userDetails/:id", verifyToken, authorize("admin"), singleUser);

export default router;