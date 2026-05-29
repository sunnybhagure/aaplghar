const express = require('express');
const router = express.Router();


const { protectUser } = require('../middleware/auth'); 
const { addBuilderReview, getBuilderReviews, deleteBuilderReview,getUserBuilderReviews  } = require('../Controller/builderReviewController');


router.post('/add', protectUser, addBuilderReview); 
router.get('/:builderId', getBuilderReviews);
router.delete('/:id', protectUser, deleteBuilderReview);
router.get('/user/:userId', getUserBuilderReviews);


module.exports = router;