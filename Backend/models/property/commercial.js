const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema({
  propertySubType: {
    type: String,
    enum: ["office", "shop", "showroom", "warehouse"]
  },

  area: Number,

  parking: Boolean,

  status: {
    type: String,
    enum: ["under_construction", "ready"]
  }
});

module.exports = commercialSchema;