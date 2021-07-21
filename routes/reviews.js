const express = require('express');
// Express does not pass params to routes in separated files
// To fix, we need to pass mergeParams: true as options to router
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Routes
// POST Route - Reviews - by chargesite id
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE Route - Reviews - by chargesite id & review id
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;