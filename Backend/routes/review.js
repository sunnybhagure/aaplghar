const express = require("express");
const router = express.Router();
const { protectUser } = require('../middleware/auth'); 
const { addReview, getPropertyReviews, deleteReview, getUserReviews, getBuilderReviews } = require("../Controller/reviewController");

router.post("/add", protectUser, addReview);
router.get("/property/:propertyId", getPropertyReviews);
router.delete("/delete/:id", protectUser, deleteReview);
router.get("/user/:userId", getUserReviews);
router.get("/builder/:builderId", getBuilderReviews);
module.exports = router;