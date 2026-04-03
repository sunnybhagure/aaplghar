const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema({
  plotTypes: [String], 
  // 'config' मधे dynamic keys (उदा. "Residential Plot") आणि त्याखाली Variants राहतील
  config: { 
    type: mongoose.Schema.Types.Mixed 
  }
});

module.exports = plotSchema;