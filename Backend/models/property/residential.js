const mongoose = require("mongoose");

const residentialSchema = new mongoose.Schema({

  propertySubType: {
    type: String,
    enum: ["villa", "apartment", "penthouse", "bungalow", "duplex", "rowhouse"]
  },

  bhkTypes: [
    {
      type: {
        type: String, // 1RK, 1BHK, 2BHK...
      },
      area: Number,
      planImage: String
    }
  ],

  status: {
    type: String,
    enum: ["under_construction", "ready"]
  }

});

module.exports = residentialSchema;