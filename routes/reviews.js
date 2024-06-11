const express = require('express');
const router = express.Router({mergeParams:true});
const CatchAsync = require('../utils/CatchAsync');
const Campground = require('../models/campground');
const Review=require('../models/review');
const ExpressError = require('../utils/ExpressError');
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware');
const review=require('../controllers/reviews');

router.post('/',isLoggedIn, validateReview, CatchAsync(review.createReview));
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, CatchAsync(review.deleteReview));

module.exports=router;