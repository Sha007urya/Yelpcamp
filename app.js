const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const Joi = require('joi');
const session=require('express-session');
const flash=require('connect-flash');
const {CampgroundSchema,reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const Review=require('./models/review');

const campgrounds=require('./routes/campgrounds');
const reviews=require('./routes/reviews');
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
app.use(express.static(path.join(__dirname,'public')));
const sessionConfig={
     secret:'thisshouldbeabettersecret!',
     resave:false,
     saveUninitialized:true,
     cookie:{
          httpOnly:true,
          expires:Date.now()+1000*60*60*24*7,
          maxAge:1000*60*60*24*7
     }
}
app.use(session(sessionConfig));
app.use(flash());
app.use((req,res,next)=>{
     res.locals.success=req.flash('success');
     res.locals.error=req.flash('error');
     next();
})

app.get('/', (req, res) => {
     res.render('home');
})


app.use('/campgrounds',campgrounds);
app.use('/campgrounds/:id/reviews',reviews);
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
