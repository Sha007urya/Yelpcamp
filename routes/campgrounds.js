const express = require('express');
const router = express.Router();
const CatchAsync = require('../utils/CatchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { CampgroundSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer=require('multer');
const {storage}=require('../cloudinary');
const upload=multer({storage});


router.route('/')
     .get(CatchAsync(campgrounds.index))
     .post(isLoggedIn,upload.array('image'),validateCampground,CatchAsync(campgrounds.createCampground))
     // .post(upload.array('image'),(req,res)=>{
     //      console.log(req.body,req.files);
     //      res.send("It worked");
     // })


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
     .get(CatchAsync(campgrounds.showCampground))
     .put(isLoggedIn, isAuthor, CatchAsync(campgrounds.updateCampground))
     .delete(isLoggedIn, isAuthor, CatchAsync(campgrounds.deleteCampground));




router.get('/:id/edit', isLoggedIn, isAuthor, CatchAsync(campgrounds.renderEditForm))


module.exports = router