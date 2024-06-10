const express=require('express');
const router=express.Router();
const CatchAsync = require('../utils/CatchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {CampgroundSchema} = require('../schemas.js');
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware');


router.get('/', async (req, res) => {
     const campgrounds = await Campground.find({});
     res.render('campgrounds/index', { campgrounds });
})
router.get('/new', isLoggedIn,async (req, res) => {
    
     res.render('campgrounds/new');
})
router.post('/',isLoggedIn, validateCampground, CatchAsync(async (req, res, next) => {


     const campground = new Campground(req.body.campground);
     campground.author=req.user._id;
     await campground.save();
     req.flash('success','Successfully added a new campground!');
     res.redirect(`/campgrounds/${campground._id}`);


}))
router.get('/:id', CatchAsync(async (req, res) => {
     const campground = await Campground.findById(req.params.id).populate({
          path:'reviews',
          populate:{
               path:'author'
          }
     }).populate('author');
     if(!campground){
          req.flash('error','Cannot find that campground!');
          return res.redirect('/campgrounds');
     }
     res.render('campgrounds/show', { campground });
}))
router.get('/:id/edit',isLoggedIn,isAuthor, CatchAsync(async (req, res) => {
     const{id}=req.params;
     const campground = await Campground.findById(id);
     if(!campground){
          req.flash('error','Cannot find that campground!');
          return res.redirect('/campgrounds');
     }
     res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn,isAuthor,CatchAsync(async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
     req.flash('success','Successfully updated Campground!');
     res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:id', isLoggedIn,isAuthor,CatchAsync(async (req, res) => {
     const { id } = req.params;
     await Campground.findByIdAndDelete(id);
     req.flash('success','Successfully deleted Campground!');
     res.redirect('/campgrounds');
}))
module.exports=router