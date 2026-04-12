const mongoose = require('mongoose');

const builderReviewSchema = new mongoose.Schema({
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    user: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        image: { type: String }
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BuilderReview', builderReviewSchema);

