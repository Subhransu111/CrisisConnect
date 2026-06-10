const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const geocodeAddress = require('../utils/geocodeAddress')

// Token Generate
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};


// POST /api/auth/register

exports.register = async (req, res) => {
    try {
        console.log("📝 [REGISTER] Starting registration with data:", { name: req.body.name, email: req.body.email, role: req.body.role });
        const { name, email, phoneNumber, password, role, location, address, volunteerCategory, volunteerProfile } = req.body;

        if (!name || !phoneNumber || !email || !password) {
            console.log("❌ [REGISTER] Missing required fields");
            return res.status(400).json({
                success: false,
                message: "Name, phone number, email and password are required",
            });
        }

        console.log("🔍 [REGISTER] Checking for existing user with email:", email);
        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
            console.log("❌ [REGISTER] User already exists");
            return res.status(400).json({
                success: false,
                message: "User with this email or phone number already exists",
            });
        }

        let userLocation = null;

        if (role === "volunteer") {
            console.log("📍 [REGISTER] Validating volunteer data...");
            
            if (!address) {
                console.log("❌ [REGISTER] Address is required for volunteers");
                return res.status(400).json({
                    success: false,
                    message: "Address is required for volunteers",
                });
            }

            if (!volunteerProfile?.skills || volunteerProfile.skills.length === 0) {
                console.log("❌ [REGISTER] No volunteer skills provided");
                return res.status(400).json({
                    success: false,
                    message: "Volunteer skills are required",
                });
            }

            // Convert address to coordinates
            console.log("🗺️ [REGISTER] Geocoding address for volunteer...");
            const coordinates = await geocodeAddress(address);
            userLocation = {
                type: "Point",
                coordinates: coordinates, // [longitude, latitude]
            };
        }

        console.log("🔐 [REGISTER] Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("💾 [REGISTER] Creating user in database...");
        const user = await User.create({
            name,
            phoneNumber,
            email,
            password: hashedPassword,
            role: role || "victim",
            location: userLocation,
            address,
            volunteerProfile: role === "volunteer" ? volunteerProfile : undefined,
        });

        console.log("✅ [REGISTER] User created successfully:", { id: user._id, email: user.email });
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
        console.error("❌ [REGISTER] Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            error: error.message,
        });
    }
}

// POST /api/auth/login

exports.login = async (req, res) => {
    try {
        console.log("🔓 [LOGIN] Login attempt with email:", req.body.email);
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("❌ [LOGIN] Missing email or password");
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        console.log("🔍 [LOGIN] Finding user by email...");
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ [LOGIN] User not found with email:", email);
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        console.log("🔐 [LOGIN] Comparing passwords...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ [LOGIN] Password mismatch for user:", email);
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        console.log("✅ [LOGIN] Login successful for user:", email);
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
        console.error("❌ [LOGIN] Error:", error.message);
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
    // Check if user exists in request
    if (!req.user) {
      console.log("❌ [GETME] No user in request - authentication failed");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log("👤 [GETME] Fetching user profile for ID:", req.user.id);
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
        console.log("❌ [GETME] User not found in database");
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    console.log("✅ [GETME] User profile fetched:", { id: user._id, role: user.role });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ [GETME] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};