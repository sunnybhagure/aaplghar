const mongoose = require("mongoose");

const residentialSchema = require("./residential");
const commercialSchema = require("./commercial");
const plotSchema = require("./plot");

const propertySchema = new mongoose.Schema({

  title: String,

  location: {
    city: String,
    area: String
  },

  propertyType: {
    type: String,
    enum: ["residential", "commercial", "plot"]
  },

 builder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin" 
  },

  price: {
    starting: Number,
    upto: Number
  },

  description: String,
  
  specification: [String],


  amenities: [String],
  nearbyLocalities: [String],

  images: {
    coverImage: String,
    gallery: [String],
    societyPlan: String,
  },

  // 👇 MAIN CONNECTION
  residentialDetails: residentialSchema,
  commercialDetails: commercialSchema,
  plotDetails: plotSchema

}, { timestamps: true });

module.exports = mongoose.model("Property", propertySchema);