const mongoose = require("mongoose");

const residentialSchema = new mongoose.Schema({
  propertySubTypes: [String], 
  // Dynamic keys handle karnyathi Mixed type vaprava lagel
  config: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
});

module.exports = residentialSchema;