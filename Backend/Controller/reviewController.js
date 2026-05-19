const Review = require("../models/Review");
const BuilderReview = require("../models/BuilderReview");
const Property = require("../models/property/propertyMain");
// Add Review
exports.addReview = async (req, res) => {
    try {
        const { property, user, userName, rating, comment } = req.body;
        const newReview = new Review({ property, user, userName, rating, comment });
        await newReview.save();
        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Reviews for a Property
exports.getPropertyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ property: req.params.propertyId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, error: "Review not found" });

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, error: "Not authorized to delete this review" });
        }
        
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Property Reviews 
exports.getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        

        const reviews = await Review.find({ user: userId })
            .populate("property", "title location") 
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.getBuilderReviews = async (req, res) => {
    try {
        const { builderId } = req.params;

     
        const properties = await Property.find({ builder: builderId }).select("_id title location images status propertyType price").lean();
        const propertyIds = properties.map(p => p._id);

        // 2. Fetch reviews for these properties
        const propertyReviews = await Review.find({ property: { $in: propertyIds } })
            .populate("property", "_id title location propertyType")
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .lean();

        // 3. Group reviews by property
        const propertyData = properties.map(prop => ({
            ...prop,
            reviews: propertyReviews.filter(r => r.property._id.toString() === prop._id.toString())
        }));

        // 4. Fetch builder reviews from BuilderReview collection
        const builderReviews = await BuilderReview.find({ builderId })
            .sort({ createdAt: -1 })
            .lean();

        // Stats Calculate Karne (Average Logic)
        let totalPropertyReviews = propertyReviews.length;
        let sumPropertyStars = propertyReviews.reduce((sum, r) => sum + r.rating, 0);

        const avgPropertyRating = totalPropertyReviews > 0 ? (sumPropertyStars / totalPropertyReviews) : 0;

        // Calculate average builder rating from BuilderReview
        let totalBuilderReviews = builderReviews.length;
        let sumBuilderStars = builderReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgBuilderRating = totalBuilderReviews > 0 ? (sumBuilderStars / totalBuilderReviews) : 0;

        res.status(200).json({
            success: true,
            properties: propertyData, // List of properties with their reviews
            builderReviews: builderReviews,
            stats: {
                totalPropertyReviews,
                avgPropertyRating: avgPropertyRating.toFixed(1),
                totalBuilderReviews,
                avgBuilderRating: avgBuilderRating.toFixed(1),
            }
        });

    } catch (error) {
        console.error("Review Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};