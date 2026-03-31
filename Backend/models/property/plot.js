const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema({
  // User multiple types select karu shakto
  plotTypes: [String], // ["residential_plot", "commercial_plot"]

  // Ekach plot project madhye multiple layout/size options
  plotVariants: [
    {
      area: Number,
      length: Number,
      width: Number,
      plotImage: String // Specific layout image for this size
    }
  ]
});

module.exports = plotSchema;