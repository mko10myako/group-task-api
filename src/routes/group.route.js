import express from "express";
import authenticateUser from "../middleware/authenticateUser.js";
import { createGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", authenticateUser, createGroup);

export default router;