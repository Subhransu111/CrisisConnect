// routes/volunteerRoutes.js

const express = require("express");

const {
  getAllVolunteers,
  getMyAcceptedCases,
  updateAvailability,
} = require("../controllers/volunteerController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getAllVolunteers);

router.get(
  "/my-cases",
  protect,
  allowRoles("volunteer"),
  getMyAcceptedCases
);

router.patch(
  "/availability",
  protect,
  allowRoles("volunteer"),
  updateAvailability
);

module.exports = router;