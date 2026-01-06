import userModel from "./user.model.js";
import { createToken } from "../../middleware/auth.middleware.js";
import xss from "xss";
import mongoose from "mongoose";

const signup = async (req, res) => {
  try {
    const { name, email, contact, age, address, password } = req.body;

    if (!name || !email || !contact || !address || !password) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const sanitizedData = {
      name: xss(name),
      email: email.toLowerCase(),
      contact,
      age,
      address: xss(address),
      password,
    };

    const userExists = await userModel.findOne({
      email: sanitizedData.email,
    });

    if (userExists) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const user = await userModel.create(sanitizedData);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: `User creation failed and error is ${error.message}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const user = await userModel
      .findOne({ email: email.toLowerCase() })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = await createToken(user);

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "User login failed",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const userId = req.user.id;

    const user = await userModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "User password reset successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "User reset password failed",
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "User logout failed",
    });
  }
};

const singleUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User found successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

export { signup, login, resetPassword, logout, singleUser };