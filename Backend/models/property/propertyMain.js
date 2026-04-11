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
    starting:{
        type: Number,
        required: true
    },
    upto: {
        type: Number,
        required: true
    },
  },

  highlights: {
        type: [String], // Array of strings sathi
        default: []
    },

  description: String,

  questions: [
  {
    question: String,
    answer: String
  }
],
  
  specification: [String],
  projectArea: String, // Total project area acres madhye
  possessionDate: String, // Step 2 madhli date
  facilities: [String],


  amenities: [String],
  nearbyLocalities: [String],

  images: {
    coverImage: String,
    gallery: [String],
    societyPlan: String,
  },
  status: { type: String, enum: ["under_construction", "ready"] },

  // 👇 MAIN CONNECTION
  residentialDetails: residentialSchema,
  commercialDetails: commercialSchema,
  plotDetails: plotSchema

}, { timestamps: true });

module.exports = mongoose.model("Property", propertySchema);