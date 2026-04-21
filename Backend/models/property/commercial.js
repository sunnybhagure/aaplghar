const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema({
  propertySubTypes: [String], 
  config: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
});

module.exports = commercialSchema;

