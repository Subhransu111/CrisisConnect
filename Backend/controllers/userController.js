const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Token Generate
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1hr",
    });
};


// POST /api/auth/register

exports.register = async (req, res) => {
    try {
        const { name, email, number: phoneNumber, password, role, location, address, volunteerCategory, volunteerProfile } = req.body;

        if (!name || !phoneNumber || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, phone number, email and password are required",
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email or phone number already exists",
            });
        }

        if (role === "volunteer") {
            if (!location || !location.coordinates || location.coordinates.length !== 2) {
                return res.status(400).json({
                    success: false,
                    message: "Volunteer location is required",
                });
            }

            if (!volunteerProfile?.skills || volunteerProfile.skills.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Volunteer skills are required",
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            phoneNumber,
            email,
            password: hashedPassword,
            role: role || "victim",
            location,
            address,
            volunteerProfile,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// POST /api/auth/login

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,  
                role: user.role,
            },
        });

    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// GET /api/auth/me

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};