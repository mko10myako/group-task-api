import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
      const { name, email, password} = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required."
        });
      }

      const existingUser = await User.findOne( { email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered."
        })
      }

      const user = await User.create({
        name,
        email,
        password
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.Message
    });
  }
};

export const loginUser = async (req, res) => {
  try {
     const { email, password } = req.body;

     if (!email || !password ) {
      return res.status(400).status.json({
        success: false,
        message: "Email and password are required."
      });
     }

     const user = await User.findOne( { email });

     if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
     }

     const isPasswordCorrect = await user.comparePassword(password);

     if(!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
     }

     const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

     return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch(error) {
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
}

export const getCurrentUser = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};