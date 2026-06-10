const mongoose = require("mongoose");

const helpCategories = [
  "medical",
  "rescue",
  "food",
  "transport",
  "shelter",
  "general",
  "fire"
];

const IncidentSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "flood",
        "earthquake",
        "fire",
        "accident",
        "medical",
        "shelter",
        "food",
        "other",
      ],
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      enum: ["quick_report", "registered_user"],
      required: true,
      default: "registered_user",
    },

    photos: [
      {
        type: String,
      },
    ],

    // For logged-in users only
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // For quick emergency reports without login
    reporterInfo: {
      name: {
        type: String,
        trim: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
    },

    requiredHelp: [
      {
        category: {
          type: String,
          enum: helpCategories,
          required: true,
        },
        requiredVolunteers: {
          type: Number,
          default: 1,
          min: 1,
        },
        fulfilledVolunteers: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    assignedVolunteers: [
      {
        volunteer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        helpCategory: {
          type: String,
          enum: helpCategories,
          required: true,
        },

        status: {
          type: String,
          enum: [
            "accepted",
            "on_the_way",
            "reached",
            "completed",
          ],
          default: "accepted",
        },

        lastLocation: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
          },
        },

        acceptedAt: {
          type: Date,
          default: Date.now,
        },

        reachedAt: {
          type: Date,
        },

        completedAt: {
          type: Date,
        },
      },
    ],

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "duplicate"],
      default: "pending",
    },

    resolutionStatus: {
      type: String,
      enum: ["open", "partially_assigned", "in_progress", "resolved", "closed"],
      default: "open",
    },

    priorityScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Important for nearby incident search
IncidentSchema.index({ location: "2dsphere" });

// Helpful for filtering dashboard and volunteer cases
IncidentSchema.index({ resolutionStatus: 1, verificationStatus: 1 });
IncidentSchema.index({ severity: 1, priorityScore: 1, createdAt: -1 });

module.exports = mongoose.model("Incident", IncidentSchema);