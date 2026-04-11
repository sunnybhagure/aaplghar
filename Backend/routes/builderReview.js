const express = require('express');
const router = express.Router();

// ITHLI CHUK SUDHAR: 'protectUser' naav vapar
const { protectUser } = require('../middleware/auth'); 
const { addBuilderReview, getBuilderReviews, deleteBuilderReview,getUserBuilderReviews  } = require('../Controller/builderReviewController');

// Ithe 'protectUser' pass kar
router.post('/add', protectUser, addBuilderReview); 
router.get('/:builderId', getBuilderReviews);
router.delete('/:id', protectUser, deleteBuilderReview);
router.get('/user/:userId', getUserBuilderReviews);


module.exports = router;