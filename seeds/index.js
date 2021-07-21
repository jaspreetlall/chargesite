// Purpose of this seeds file is to feed the 
// fresh data into the database after deleting
// old data

const mongoose = require('mongoose');
const cities = require('./cities');
const { nouns, descriptors } = require('./seedHelpers');
const Chargesite = require('../models/chargesite');

mongoose.connect('mongodb://localhost:27017/chargesite', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

// Handling connection errors - Mongoose
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => console.log("Database connected"));

// Function to return random array item
const randomItemFrom = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  // WARNING - DELETEs data from database before seeding
  await Chargesite.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const chargesite = new Chargesite ({
      author: '60ec6e1fc5a06b19f0fd7e7a',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${randomItemFrom(descriptors)} ${randomItemFrom(nouns)}`,
      images: [
        {
          url: 'https://res.cloudinary.com/jsl/image/upload/v1625440262/charge-site/chuttersnap-xJLsHl0hIik-unsplash_bmrets.jpg',
          filename: 'charge-site/chuttersnap-xJLsHl0hIik-unsplash_bmrets'
        },
        {
          url: 'https://res.cloudinary.com/jsl/image/upload/v1625440262/charge-site/ernest-ojeh-UrCV-U9hhCo-unsplash_tvtjv6.jpg',
          filename: 'charge-site/ernest-ojeh-UrCV-U9hhCo-unsplash_tvtjv6.jpg'
        }
      ],
      description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend',
      // can also be just price instead of price: price
      price: price,
      // Getting longitude and latitudes from cities
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      }
    })
    await chargesite.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
})