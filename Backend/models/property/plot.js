const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema({
  plotTypes: [String], 
  config: { 
    type: mongoose.Schema.Types.Mixed 
  }
});

module.exports = plotSchema;


