import express from "express";
import authenticateUser from "../middleware/authenticateUser.js";
import { 
  createGroup,
  getOwnedGroups,
  getGroupById,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", authenticateUser, createGroup);
router.get("/", authenticateUser, getOwnedGroups);
router.get("/:groupId", authenticateUser, getGroupById);

export default router;
