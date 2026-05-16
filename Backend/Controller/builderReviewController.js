const BuilderReview = require('../models/BuilderReview');

exports.addBuilderReview = async (req, res) => {
    try {
        const { builderId, rating, comment } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication failed!" });
        }
        const newReview = new BuilderReview({
            builderId,
            rating,
            comment,
            user: {
                id: req.user._id,
                name: req.user.name,
                image: req.user.profileImage || "" 
            }
        });
        await newReview.save();
        res.status(201).json({ success: true, data: newReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getBuilderReviews = async (req, res) => {
    try {
        const reviews = await BuilderReview.find({ builderId: req.params.builderId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteBuilderReview = async (req, res) => {
    try {
        const review = await BuilderReview.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        if (review.user.id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        await review.deleteOne();
        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Reviews given by a specific User
// Builder Reviews Controller
exports.getUserBuilderReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const reviews = await BuilderReview.find({ "user.id": userId })
            .populate("builderId", "name companyName") 
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};