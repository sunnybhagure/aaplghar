const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema({
  propertySubTypes: [String], 
  config: { 
    type: mongoose.Schema.Types.Mixed 
  },
  parking: { type: Boolean, default: false },
  status: { type: String, enum: ["under_construction", "ready"] }
});

module.exports = commercialSchema;