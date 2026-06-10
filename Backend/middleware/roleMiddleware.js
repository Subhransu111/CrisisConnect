exports.allowRoles = (...roles) => {
  console.log(`👤 [ROLES] Middleware created for roles:`, roles);
  return (req, res, next) => {
    console.log(`👤 [ROLES] Checking user role. Required: ${roles}, User role: ${req.user?.role}`);
    
    if (!req.user) {
      console.log("❌ [ROLES] No user in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ [ROLES] Access denied. User role '${req.user.role}' not in allowed roles:`, roles);
      return res.status(403).json({
        success: false,
        message: "Access denied for this role",
      });
    }

    console.log(`✅ [ROLES] Access granted for role: ${req.user.role}`);
    next();
  };
};