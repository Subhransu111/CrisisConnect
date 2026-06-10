const Incident = require("../models/Incident");
const User = require("../models/User");

// GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();

    const openIncidents = await Incident.countDocuments({
      resolutionStatus: "open",
    });

    const inProgressIncidents = await Incident.countDocuments({
      resolutionStatus: "in_progress",
    });

    const resolvedIncidents = await Incident.countDocuments({
      resolutionStatus: "resolved",
    });

    const pendingVerification = await Incident.countDocuments({
      verificationStatus: "pending",
    });

    const verifiedIncidents = await Incident.countDocuments({
      verificationStatus: "verified",
    });

    const rejectedIncidents = await Incident.countDocuments({
      verificationStatus: "rejected",
    });

    const totalVolunteers = await User.countDocuments({
      role: "volunteer",
    });

    const availableVolunteers = await User.countDocuments({
      role: "volunteer",
      "volunteerProfile.availability": "available",
    });

    const busyVolunteers = await User.countDocuments({
      role: "volunteer",
      "volunteerProfile.availability": "busy",
    });

    const offlineVolunteers = await User.countDocuments({
      role: "volunteer",
      "volunteerProfile.availability": "offline",
    });

    const dashboardStats = await Incident.aggregate([
  {
    $facet: {
      byType: [
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      bySeverity: [
        { $group: { _id: "$severity", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      byStatus: [
        { $group: { _id: "$resolutionStatus", count: { $sum: 1 } } }
      ]
    }
  }
]);

    const recentCriticalIncidents = await Incident.find({
      severity: "critical",
    })
      .select("caseId title type severity address resolutionStatus verificationStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        incidents: {
          total: totalIncidents,
          open: openIncidents,
          inProgress: inProgressIncidents,
          resolved: resolvedIncidents,
          pendingVerification,
          verified: verifiedIncidents,
          rejected: rejectedIncidents,
        },

        volunteers: {
          total: totalVolunteers,
          available: availableVolunteers,
          busy: busyVolunteers,
          offline: offlineVolunteers,
        },

        charts: {
          byType: dashboardStats[0].byType,
          bySeverity: dashboardStats[0].bySeverity,
          byStatus: dashboardStats[0].byStatus,
        },

        recentCriticalIncidents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      error: error.message,
    });
  }
};