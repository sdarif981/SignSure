import bcrypt from "bcryptjs";

import { generateKeys } from "../utils/generate_keys.js";
import { encryptKey } from "../utils/encrypt_key.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, public_key } = req.body;

    // 1. Validate input
    if (!name || !email || !password || !public_key) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user (do NOT store private key!)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      public_key, 
    });

    await newUser.save();

    // 5. Respond with success (frontend handles localStorage)
    return res.status(201).json({
      message: "User registered successfully.",
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email or password missing",
        success: false
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    const responseUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      public_key: user.public_key
    };

    res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", 
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 24 * 60 * 60 * 1000,
}).json({
        message: `Welcome back ${responseUser.name}`,
        user: responseUser,
        success: true
      });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    return res.status(200).json({
      message: 'Logout successful',
      success: true,
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
};

