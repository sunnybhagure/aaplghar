const plotSchema = new mongoose.Schema({
  plotType: {
    type: String,
    enum: ["residential_plot", "commercial_plot"]
  },

  area: Number,

  length: Number,
  width: Number
});

module.exports = plotSchema;