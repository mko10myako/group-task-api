import Group from "../models/group.model.js";

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