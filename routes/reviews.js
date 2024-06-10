const express = require('express');
const router = express.Router({mergeParams:true});
const CatchAsync = require('../utils/CatchAsync');
const Campground = require('../models/campground');
const Review=require('../models/review');
const ExpressError = require('../utils/ExpressError');
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware');

router.post('/',isLoggedIn, validateReview, CatchAsync(async (req, res) => {
     const campground = await Campground.findById(req.params.id);
     const review = new Review(req.body.review);
     review.author=req.user._id;
     campground.reviews.push(review);
     await review.save();
     await campground.save();
     req.flash('success','Created New Review!');
     res.redirect(`/campgrounds/${campground._id}`);


}))
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, CatchAsync(async (req, res) => {
     const { id, reviewId } = req.params;
     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
     await Review.findByIdAndDelete(reviewId);
     req.flash('success','Successfully deleted review!');
     res.redirect(`/campgrounds/${id}`);
}))

module.exports=router;