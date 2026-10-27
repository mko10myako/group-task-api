import express from "express";
import authenticateUser from "../middleware/authenticateUser.js";
import { 
  createGroup,
  getOwnedGroups
 } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", authenticateUser, createGroup);
router.get("/", authenticateUser, getOwnedGroups);

export default router;