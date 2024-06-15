if(process.env.NODE_ENV !=="production"){
     require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const Joi = require('joi');
const session=require('express-session');
const flash=require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const Review=require('./models/review');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const helmet=require('helmet');

const campgroundsRoutes=require('./routes/campgrounds');
const reviewsRoutes=require('./routes/reviews');
const userRoutes=require('./routes/users');
const mongoSanitize=require('./models/user')
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
app.use(mongoSanitize(
     {replaceWith:'_'}
));
const sessionConfig={
     name:'session',
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
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
     res.locals.currentUser=req.user;
     res.locals.success=req.flash('success');
     res.locals.error=req.flash('error');
     next();
})
app.use('/fakeUser', async(req,res)=>{
     const user=new User({email:'shaurya@gmail.com',username:'shaurya'});
     const newUser=await User.register(user,'chicken');
     res.send(newUser);

})

app.get('/', (req, res) => {
     res.render('home');
})

app.use('/',userRoutes)
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);
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
