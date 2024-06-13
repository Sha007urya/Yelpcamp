const unsplashAccessKey = 'A_kAG4fGzAtR7LO9Z6xHfJeYIUlW6IFYwIkaH0GEtBs'; // Replace this with your actual access key

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '66660950a6d04832d7f45dca',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)},${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellendus magni ab qui aliquid, aut maiores',
            images:[    
            {
                url: 'https://res.cloudinary.com/dyeoerjzn/image/upload/v1718272463/YelpCamp/mvrkd7hvcgzyurlxe1vr.jpg',   
                filename: 'YelpCamp/mvrkd7hvcgzyurlxe1vr',        
                 
              },
              {
                url: 'https://res.cloudinary.com/dyeoerjzn/image/upload/v1718272464/YelpCamp/atfbztmg5tiavoqqbdvt.jpg',   
                filename: 'YelpCamp/atfbztmg5tiavoqqbdvt',        
           
              },
              {
                url: 'https://res.cloudinary.com/dyeoerjzn/image/upload/v1718272464/YelpCamp/xb4skqwtumeje6647wpo.jpg',   
                filename: 'YelpCamp/xb4skqwtumeje6647wpo',        
             
              }
            ]
        })

        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

