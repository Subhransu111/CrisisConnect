// controllers/volunteerController.js

const Incident = require("../models/Incident");
const User = require("../models/User");

// POST /api/incidents/:id/accept
exports.acceptIncident = async (req, res) => {
  try {
    console.log("🤝 [ACCEPT] Volunteer accepting incident - ID:", req.params.id, "Category:", req.body.helpCategory);
    const { helpCategory } = req.body;
    const incidentId = req.params.id;
    const volunteerId = req.user.id;

    console.log("🔍 [ACCEPT] Verifying volunteer status...");
    const volunteer = await User.findById(volunteerId);

    if (!volunteer || volunteer.role !== "volunteer") {
      console.log("❌ [ACCEPT] User is not a volunteer");
      return res.status(403).json({
        success: false,
        message: "Only volunteers can accept incidents",
      });
    }

    if (!helpCategory) {
      console.log("❌ [ACCEPT] No help category specified");
      return res.status(400).json({
        success: false,
        message: "Help category is required",
      });
    }

    console.log("🔍 [ACCEPT] Finding incident...");
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      console.log("❌ [ACCEPT] Incident not found");
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const alreadyAccepted = incident.assignedVolunteers.some(
      (item) => item.volunteer.toString() === volunteerId
    );

    if (alreadyAccepted) {
      console.log("❌ [ACCEPT] Volunteer already accepted this incident");
      return res.status(400).json({
        success: false,
        message: "You have already accepted this incident",
      });
    }

    const requiredHelpItem = incident.requiredHelp.find(
      (item) => item.category === helpCategory
    );

    if (!requiredHelpItem) {
      console.log("❌ [ACCEPT] Help category not needed for this incident");
      return res.status(400).json({
        success: false,
        message: "This help category is not required for the incident",
      });
    }

    if (requiredHelpItem.fulfilledVolunteers >= requiredHelpItem.requiredVolunteers) {
      console.log("❌ [ACCEPT] This help category is already fulfilled");
      return res.status(400).json({
        success: false,
        message: "Required volunteers for this category are already fulfilled",
      });
    }

    console.log("✅ [ACCEPT] Adding volunteer to incident...");
    incident.assignedVolunteers.push({
      volunteer: volunteerId,
      helpCategory,
      status: "accepted",
      acceptedAt: new Date(),
    });

    requiredHelpItem.fulfilledVolunteers += 1;

    const totalRequired = incident.requiredHelp.reduce(
      (sum, item) => sum + item.requiredVolunteers,
      0
    );

    const totalFulfilled = incident.requiredHelp.reduce(
      (sum, item) => sum + item.fulfilledVolunteers,
      0
    );

    console.log("📊 [ACCEPT] Fulfilled volunteers:", totalFulfilled, "/ Required:", totalRequired);

    if (totalFulfilled === 0) {
      incident.resolutionStatus = "open";
    } else if (totalFulfilled < totalRequired) {
      incident.resolutionStatus = "partially_assigned";
    } else {
      incident.resolutionStatus = "in_progress";
    }

    await incident.save();
    console.log("✅ [ACCEPT] Incident status updated");

    const populatedIncident = await Incident.findById(incidentId)
      .populate("assignedVolunteers.volunteer", "name phoneNumber volunteerProfile")
      .populate("reportedBy", "name phoneNumber email");

    const io = req.app.get("io");

    if (io) {
      console.log("📡 [ACCEPT] Broadcasting incident update via Socket.io");
      io.to(`incident_${incident._id}`).emit("incident:accepted", populatedIncident);
      io.emit("incident:update", populatedIncident);
    }

    res.status(200).json({
      success: true,
      message: "Incident accepted successfully",
      incident: populatedIncident,
    });
  } catch (error) {
    console.error("❌ [ACCEPT] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to accept incident",
      error: error.message,
    });
  }
};

// PATCH /api/incidents/:id/volunteer-status
exports.updateVolunteerStatus = async (req, res) => {
  try {
    console.log("🚗 [STATUS] Updating volunteer status - ID:", req.params.id, "Status:", req.body.status);
    const { status } = req.body;
    const incidentId = req.params.id;
    const volunteerId = req.user.id;

    const allowedStatus = [
      "accepted",
      "on_the_way",
      "reached",
      "completed",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      console.log("❌ [STATUS] Invalid status provided:", status);
      return res.status(400).json({
        success: false,
        message: "Invalid volunteer status",
      });
    }

    const incident = await Incident.findById(incidentId);

    if (!incident) {
      console.log("❌ [STATUS] Incident not found");
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const assignedVolunteer = incident.assignedVolunteers.find(
      (item) => item.volunteer.toString() === volunteerId
    );

    if (!assignedVolunteer) {
      console.log("❌ [STATUS] Volunteer not assigned to this incident");
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this incident",
      });
    }

    console.log("✅ [STATUS] Updating status from", assignedVolunteer.status, "to", status);
    assignedVolunteer.status = status;

    if (status === "reached") {
      assignedVolunteer.reachedAt = new Date();
    }

    if (status === "completed") {
      assignedVolunteer.completedAt = new Date();
    }

    const activeVolunteers = incident.assignedVolunteers.filter((item) => item.status !== "cancelled");
    const completedVolunteers = incident.assignedVolunteers.filter((item) => item.status === "completed");

    if (activeVolunteers.length > 0 && completedVolunteers.length === activeVolunteers.length) {
      incident.resolutionStatus = "resolved";
      console.log("🎉 [STATUS] All volunteers completed - incident resolved");
    }

    await incident.save();
    const populatedIncident = await Incident.findById(incidentId)
      .populate("assignedVolunteers.volunteer", "name phoneNumber volunteerProfile")
      .populate("reportedBy", "name phoneNumber email");

    const io = req.app.get("io");

    if (io) {
      console.log("📡 [STATUS] Broadcasting status update via Socket.io");
      io.to(`incident_${incident._id}`).emit(
        "volunteer:status-update",
        populatedIncident
      );
      io.emit("incident:update", populatedIncident);
    }

    res.status(200).json({
      success: true,
      message: "Volunteer status updated successfully",
      incident: populatedIncident,
    });
  } catch (error) {
    console.error("❌ [STATUS] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer status",
      error: error.message,
    });
  }
};

// GET /api/volunteers/my-cases
exports.getMyAcceptedCases = async (req, res) => {
  try {
    const volunteerId = req.user.id;

    const incidents = await Incident.find({
      "assignedVolunteers.volunteer": volunteerId,
    })
      .populate("reportedBy", "name phoneNumber email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch accepted cases",
      error: error.message,
    });
  }
};

// PATCH /api/incidents/:id/volunteer-location
exports.updateVolunteerLocation = async (req, res) => {
  try {
    const { coordinates } = req.body;
    const incidentId = req.params.id;
    const volunteerId = req.user.id;

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Coordinates are required as [longitude, latitude]",
      });
    }

    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const assignedVolunteer = incident.assignedVolunteers.find(
      (item) => item.volunteer.toString() === volunteerId
    );

    if (!assignedVolunteer) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this incident",
      });
    }

    if (assignedVolunteer.status !== "on_the_way") {
      return res.status(400).json({
        success: false,
        message: "Location can only be updated when volunteer is on the way",
      });
    }

    assignedVolunteer.lastLocation = {
      type: "Point",
      coordinates,
    };

    await incident.save();

    const io = req.app.get("io");

    if (io) {
      io.to(`incident_${incident._id}`).emit("volunteer:location-update", {
        incidentId: incident._id,
        volunteerId,
        coordinates,
        updatedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Volunteer location updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer location",
      error: error.message,
    });
  }
};


// GET /api/volunteers

exports.getAllVolunteers = async()=>{
  try{
    const volunteers = await User.find({role:"volunteer"})
        .select("-password")
        .sort({createdAt:-1});
      
      
      res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteers",
      error: error.message,
    });
  }
};


//PATCH  /api/volunteer/availability

  // PATCH /api/volunteers/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const allowedAvailability = ["available", "busy", "offline"];

    if (!allowedAvailability.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status",
      });
    }

    const volunteer = await User.findById(req.user.id);

    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(403).json({
        success: false,
        message: "Only volunteers can update availability",
      });
    }

    volunteer.volunteerProfile.availability = availability;
    await volunteer.save();

    const io = req.app.get("io");

    if (io) {
      io.emit("volunteer:availability-update", {
        volunteerId: volunteer._id,
        availability,
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        availability: volunteer.volunteerProfile.availability,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message,
    });
  }
};




