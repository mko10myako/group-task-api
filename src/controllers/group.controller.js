import Group from "../models/group.model.js";
import mongoose from "mongoose";

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required.",
      });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Group created successfully.",
      group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Group creation failed.",
      error: error.message,
    });
  }
};

export const getOwnedGroups = async (req, res) => {
  
  try {
    const groups = await Group.find({
      owner: req.user._id,
    });

    return res.status(200).json({
      success: true,
      groups
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get groups.",
    });
  }
  
};

export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID.",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    return res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get group.",
    });
  }
};