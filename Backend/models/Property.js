const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    area: {
      type: String,
      required: true,
    },

    bedrooms: Number,
    bathrooms: Number,

    amenities: [
      {
        type: String,
      },
    ],

    // ✅ Cloudinary Images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    // Society Plan (Cloudinary)
    societyPlan: {
      url: String,
      public_id: String,
    },

    // Home Plan (Cloudinary)
    homePlan: {
      url: String,
      public_id: String,
    },

    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);