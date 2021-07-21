const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// ImageSchema separated out to add virtual attributes for thumbnail
const ImageSchema = new Schema({
  url: String,
  filename: String
})
// Adding the virtual attribute to generate
// low-res thumbnail url from cloudinary
ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
})

// Options for including virtuals in the JSON conversions
const options = { toJSON: { virtuals: true } }

const ChargesiteSchema = new Schema({
  title: String,
  images: [ImageSchema],
  // https://mongoosejs.com/docs/geojson.html
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
}, options)

// Virtual property to add markup for Mapbox popup
// Specifically added under properties for mapbox expectations
ChargesiteSchema.virtual('properties.popUpMarkup').get(function () {
  return `
    <a href="/chargesites/${this._id}">${this.title}</a>
  `;
})

// "Query" middleware to delete reviews when a chargesite is deleted
// Takes action post 'findOneAndDelete' operations only
ChargesiteSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model('Chargesite', ChargesiteSchema);