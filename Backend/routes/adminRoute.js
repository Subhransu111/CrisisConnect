const express = require('express')
const { getAdminStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/stats", protect, allowRoles("admin"), getAdminStats);

module.exports = router;