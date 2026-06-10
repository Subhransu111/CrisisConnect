const Incident = require('../models/Incident');

const generateCaseId = ()=>{
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CASE-${random}`;
}

const calculatepriority = (severity) => {
    switch (severity) {   
        case 'medium':
            return 50;
        case 'high':
            return 75;
        case 'critical':
            return 100;
        default:
            return 25; 
    }
}

// POST /api/incidents/quick-report

exports.quickReport = async (req, res) => {
    try{
        console.log("🚨 [QUICK-REPORT] Quick incident report received:", { title: req.body.title, type: req.body.type, severity: req.body.severity });
        const { title, description, type, severity, location, address , reporterInfo , requiredHelp , photos } = req.body;
        if (!title || !description || !type || !location || !address) {
            console.log("❌ [QUICK-REPORT] Missing required fields");
            return res.status(400).json({
                success: false,
                message: "Title, description, type, location and address are required",
            });
        }
        if (!reporterInfo?.name || !reporterInfo?.phoneNumber) {
            console.log("❌ [QUICK-REPORT] Missing reporter information");
            return res.status(400).json({
                success: false,
                message: "Reporter name and phone number are required",
            });
        }

        if (!location.coordinates || location.coordinates.length !== 2) {
            console.log("❌ [QUICK-REPORT] Invalid coordinates");
            return res.status(400).json({
        success: false,
        message: "Valid coordinates are required as [longitude, latitude]",
            });
        }

        console.log("💾 [QUICK-REPORT] Creating incident in database...");
        const incident = await Incident.create({
            caseId: generateCaseId(),
            title,
            description,
            type,
            severity: severity || "medium",
            location,
            address,
            source: "quick_report",
            reporterInfo,
            requiredHelp,
            photos,
            priorityScore: calculatepriority(severity || "medium"),
            verificationStatus: "pending",
            resolutionStatus: "open",
        })

        console.log("✅ [QUICK-REPORT] Incident created with ID:", incident._id);
        const io = req.app.get("io");

        if (io) {
            console.log("📡 [QUICK-REPORT] Broadcasting incident via Socket.io");
            io.emit("incident:new", incident);
            if (incident.severity === "critical") {
                console.log("🚨 [QUICK-REPORT] CRITICAL incident alert broadcast");
                io.emit("alert:critical", incident);
            }
        }

        res.status(201).json({
            success: true,
            message: "Quick Emergency Incident reported successfully",
            incident,
        }); 

    }
    catch(error){
            console.error("❌ [QUICK-REPORT] Error:", error.message);
            res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }

}


// POST /api/incidents
exports.createIncident = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      location,
      address,
      requiredHelp,
      photos,
    } = req.body;

    if (!title || !description || !type || !location || !address) {
      return res.status(400).json({
        success: false,
        message: "Title, description, type, location and address are required",
      });
    }

    if (!location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Valid coordinates are required as [longitude, latitude]",
      });
    }

    const incident = await Incident.create({
      caseId: generateCaseId(),
      title,
      description,
      type,
      severity: severity || "medium",
      priorityScore: calculatepriority(severity || "medium"),
      location,
      address,
      requiredHelp,
      photos,
      source: "registered_user",
      reportedBy: req.user.id,
      verificationStatus: "pending",
      resolutionStatus: "open",
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("incident:new", incident);

      if (incident.severity === "critical") {
        io.emit("alert:critical", incident);
      }
    }

    res.status(201).json({
      success: true,
      message: "Incident created successfully",
      incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create incident",
      error: error.message,
    });
  }
};

// GET /api/incidents
exports.getAllIncidents = async (req, res) => {
  try {
    console.log("📋 [GET-ALL] Fetching incidents with filters:", req.query);
    const {
      status,
      severity,
      type,
      verificationStatus,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (status) filter.resolutionStatus = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const skip = (Number(page) - 1) * Number(limit);
    console.log("📊 [GET-ALL] Query params - page:", page, "limit:", limit, "skip:", skip);

    const incidents = await Incident.find(filter)
      .populate("reportedBy", "name phoneNumber email")
      .populate("assignedVolunteers.volunteer", "name phoneNumber volunteerProfile")
      .sort({ priorityScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Incident.countDocuments(filter);
    console.log("✅ [GET-ALL] Found", incidents.length, "incidents (total:", total + ")");

    res.status(200).json({
      success: true,
      count: incidents.length,
      total,
      page: Number(page),
      incidents,
    });
  } catch (error) {
    console.error("❌ [GET-ALL] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incidents",
      error: error.message,
    });
  }
};

// GET /api/incidents/:id
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("reportedBy", "name phoneNumber email")
      .populate("assignedVolunteers.volunteer", "name phoneNumber volunteerProfile");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch incident",
      error: error.message,
    });
  }
};

// GET /api/incidents/nearby?lng=85.8245&lat=20.2961&radius=10000
exports.getNearbyIncidents = async (req, res) => {
  try {
    const { lng, lat, radius = 10000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "Longitude and latitude are required",
      });
    }

    const incidents = await Incident.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius),
        },
      },
      resolutionStatus: { $in: ["open", "partially_assigned", "in_progress"] },
    })
      .populate("assignedVolunteers.volunteer", "name phoneNumber volunteerProfile")
      .limit(50);

    res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby incidents",
      error: error.message,
    });
  }
};

// PATCH /api/incidents/:id/status
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { resolutionStatus } = req.body;

    const allowedStatus = [
      "open",
      "partially_assigned",
      "in_progress",
      "resolved",
      "closed",
    ];

    if (!allowedStatus.includes(resolutionStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident status",
      });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { resolutionStatus },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.to(`incident_${incident._id}`).emit("incident:update", incident);
      io.emit("incident:update", incident);
    }

    res.status(200).json({
      success: true,
      message: "Incident status updated successfully",
      incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update incident status",
      error: error.message,
    });
  }
};

// PATCH /api/incidents/:id/verify
exports.verifyIncident = async (req, res) => {
  try {
    const { verificationStatus } = req.body;

    const allowedStatus = ["pending", "verified", "rejected", "duplicate"];

    if (!allowedStatus.includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status",
      });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("incident:verified", incident);
    }

    res.status(200).json({
      success: true,
      message: "Incident verification updated successfully",
      incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify incident",
      error: error.message,
    });
  }
};

// POST /api/incidents/:id/withdraw
exports.withdrawFromIncident = async (req, res) => {
  try {
    const incidentId = req.params.id;
    const volunteerId = req.user.id;

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

    if (assignedVolunteer.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "You have already withdrawn from this incident",
      });
    }

    if (assignedVolunteer.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "You cannot withdraw after completing the incident",
      });
    }

    const helpCategory = assignedVolunteer.helpCategory;

    assignedVolunteer.status = "cancelled";

    const helpItem = incident.requiredHelp.find(
      (item) => item.category === helpCategory
    );

    if (helpItem && helpItem.fulfilledVolunteers > 0) {
      helpItem.fulfilledVolunteers -= 1;
    }

    const totalRequired = incident.requiredHelp.reduce(
      (sum, item) => sum + item.requiredVolunteers,
      0
    );

    const totalFulfilled = incident.requiredHelp.reduce(
      (sum, item) => sum + item.fulfilledVolunteers,
      0
    );

    if (totalFulfilled === 0) {
      incident.resolutionStatus = "open";
    } else if (totalFulfilled < totalRequired) {
      incident.resolutionStatus = "partially_assigned";
    } else {
      incident.resolutionStatus = "in_progress";
    }

    await incident.save();

    const populatedIncident = await Incident.findById(incidentId)
      .populate("reportedBy", "name phoneNumber email")
      .populate("assignedVolunteers.volunteer", "name phoneNumber volunteerProfile");

    const io = req.app.get("io");

    if (io) {
      io.to(`incident_${incident._id}`).emit("incident:update", populatedIncident);
      io.emit("incident:update", populatedIncident);
    }

    res.status(200).json({
      success: true,
      message: "Withdrawn from incident successfully",
      incident: populatedIncident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to withdraw from incident",
      error: error.message,
    });
  }
};