const express = require('express');

const {quickReport,createIncident,getAllIncidents,getIncidentById,getNearbyIncidents,updateIncidentStatus,verifyIncident , withdrawFromIncident} = require("../controllers/incidentController")
const {acceptIncident,updateVolunteerLocation,updateVolunteerStatus } = require('../controllers/volunteerController')

const {protect} = require('../middleware/authMiddleware')
const {allowRoles} = require('../middleware/roleMiddleware')


const router = express.Router()

router.post("/quick-report", quickReport);

router.post("/", protect, allowRoles("victim", "admin"), createIncident);

router.get("/", protect, getAllIncidents);

// keep nearby before :id
router.get("/nearby", protect, getNearbyIncidents);

router.get("/:id", protect, getIncidentById);

router.patch(
  "/:id/status",
  protect,
  allowRoles("volunteer", "admin"),
  updateIncidentStatus
);

router.patch("/:id/verify", protect, allowRoles("admin"), verifyIncident);

router.post("/:id/accept", protect, allowRoles("volunteer"), acceptIncident);

router.post(
  "/:id/withdraw",
  protect,
  allowRoles("volunteer"),
  withdrawFromIncident
);

router.patch(
  "/:id/volunteer-status",
  protect,
  allowRoles("volunteer"),
  updateVolunteerStatus
);

router.patch(
  "/:id/volunteer-location",
  protect,
  allowRoles("volunteer"),
  updateVolunteerLocation
);

module.exports = router;