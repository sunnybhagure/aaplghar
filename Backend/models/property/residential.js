const mongoose = require("mongoose");

const residentialSchema = new mongoose.Schema({
  propertySubTypes: [String], 
  
  config: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
});

module.exports = residentialSchema;

