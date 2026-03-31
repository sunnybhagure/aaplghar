const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema({
  propertySubTypes: [String], // Shop, Office etc
  details: [
    {
      subType: String,
      area: Number,
      planImage: String
    }
  ],
  parking: Boolean,
  status: { type: String, enum: ["under_construction", "ready"] }
});
module.exports = commercialSchema;