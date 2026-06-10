const jwt = require('jsonwebtoken')
const User = require('../models/User')


exports.protect = async (req,res,next) =>{
    try{
        let token;
        console.log("🔐 [AUTH] Protecting route - checking authorization header");

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ){
            token = req.headers.authorization.split(" ")[1];
            console.log("🔐 [AUTH] Token extracted from header");
        }

        if (!token){
            console.log("❌ [AUTH] No token found");
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing",
            });
        };
        
        console.log("🔐 [AUTH] Verifying JWT token...");
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        console.log("✅ [AUTH] JWT verified. User ID:", decoded.id);
        
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            console.log("❌ [AUTH] User not found in database for ID:", decoded.id);
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        console.log("✅ [AUTH] User authenticated:", { id: user._id, role: user.role, email: user.email });

        req.user = {
            id: user._id,
            role: user.role,
        };
        
        console.log("✅ [AUTH] req.user set successfully");
        next();

    } catch (error) {
        console.error("❌ [AUTH] Authentication error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
            error: error.message,
        });
    }
};

        