const express=require('express');
const router=express.Router();
const CatchAsync = require('../utils/CatchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {CampgroundSchema} = require('../schemas.js');

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

router.get('/', async (req, res) => {
     const campgrounds = await Campground.find({});
     res.render('campgrounds/index', { campgrounds });
})
router.get('/new', async (req, res) => {
     res.render('campgrounds/new');
})
router.post('/', validateCampground, CatchAsync(async (req, res, next) => {


     const campground = new Campground(req.body.campground);
     await campground.save();
     req.flash('success','Successfully added a new campground!');
     res.redirect(`/campgrounds/${campground._id}`);


}))
router.get('/:id', CatchAsync(async (req, res) => {
     const campground = await Campground.findById(req.params.id).populate('reviews');
     res.render('campgrounds/show', { campground });
}))
router.get('/:id/edit', CatchAsync(async (req, res) => {
     const campground = await Campground.findById(req.params.id);
     res.render('campgrounds/edit', { campground });
}))
router.put('/:id', CatchAsync(async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
     res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:id', CatchAsync(async (req, res) => {
     const { id } = req.params;
     await Campground.findByIdAndDelete(id);
     res.redirect('/campgrounds');
}))
module.exports=router