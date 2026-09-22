import express from "express";
import authenticateUser from "../middleware/authenticateUser.js"

import {
  registerUser,
  loginUser,
  getCurrentUser
} 
from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateUser, getCurrentUser);

export default router;