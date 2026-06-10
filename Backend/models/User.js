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

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "volunteer", "victim"],
      default: "victim",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },

    address: {
      type: String,
      trim: true,
    },

    volunteerProfile: {
      skills: [
        {
          type: String,
          enum: helpCategories,
        },
      ],

      availability: {
        type: String,
        enum: ["available", "busy", "offline"],
        default: "offline",
      },

      trustLevel: {
        type: String,
        enum: ["new", "verified", "trusted"],
        default: "new",
      },

      pastAssistance: {
        type: Number,
        default: 0,
      },

      isVerifiedVolunteer: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

// Important for nearby volunteer search
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);