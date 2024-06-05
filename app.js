const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const Joi = require('joi');
const {CampgroundSchema,reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const CatchAsync = require('./utils/CatchAsync');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const Review=require('./models/review');
mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
     console.log("database connected");
});
const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.get('/', (req, res) => {
     res.render('home');
})
const validateCampground = (req, res, next) => {

     const { error } = CampgroundSchema.validate(req.body);
     if (error) {
          const msg = error.details.map(el => el.message).join(',')
          throw new ExpressError(msg, 400);
     }
     else {
          next();
     }
}
const validateReview = (req, res, next) => {

     const { error } = reviewSchema.validate(req.body);
     if (error) {
          const msg = error.details.map(el => el.message).join(',')
          throw new ExpressError(msg, 400);
     }
     else {
          next();
     }
}
app.get('/campgrounds', async (req, res) => {
     const campgrounds = await Campground.find({});
     res.render('campgrounds/index', { campgrounds });
})
app.get('/campgrounds/new', async (req, res) => {
     res.render('campgrounds/new');
})
app.post('/campgrounds', validateCampground, CatchAsync(async (req, res, next) => {


     const campground = new Campground(req.body.campground);
     await campground.save();
     res.redirect(`/campgrounds/${campground._id}`);


}))
app.get('/campgrounds/:id', CatchAsync(async (req, res) => {
     const campground = await Campground.findById(req.params.id).populate('reviews');
     res.render('campgrounds/show', { campground });
}))
app.get('/campgrounds/:id/edit', CatchAsync(async (req, res) => {
     const campground = await Campground.findById(req.params.id);
     res.render('campgrounds/edit', { campground });
}))
app.put('/campgrounds/:id', CatchAsync(async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
     res.redirect(`/campgrounds/${campground._id}`);
}))
app.delete('/campgrounds/:id', CatchAsync(async (req, res) => {
     const { id } = req.params;
     await Campground.findByIdAndDelete(id);
     res.redirect('/campgrounds');
}))
app.post('/campgrounds/:id/reviews',validateReview, CatchAsync(async (req, res) => {
const campground=await Campground.findById(req.params.id);
const review=new Review(req.body.review);
campground.reviews.push(review);
await review.save();
await campground.save();
res.redirect(`/campgrounds/${campground._id}`);


}))
app.delete('/campgrounds/:id/reviews/:reviewId',CatchAsync(async(req,res)=>{
     const{id,reviewId}=req.params;
     await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
     await Review.findByIdAndDelete(reviewId);
     res.redirect(`/campgrounds/${id}`);
}))
app.all('*', (req, res, next) => {
     next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
     const { status_code = 500, message = 'Oh boy something went wrong' } = err;
     if (!err.message) {
          err.message = 'Oh no Something went Wrong!'
     }
     res.status(status_code).render('error', { err });
})
app.listen(3000, () => {
     console.log("serving on port 3000");
})
