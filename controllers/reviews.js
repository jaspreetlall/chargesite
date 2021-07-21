const Review = require('../models/review');
const Chargesite = require('../models/chargesite');

// Create review
module.exports.createReview = async(req, res) => {
  const requestedChargesite = await Chargesite.findById(req.params.id);
  const newReview = new Review(req.body);
  newReview.author = req.user._id;
  requestedChargesite.reviews.push(newReview);
  await newReview.save();
  await requestedChargesite.save();
  req.flash('success', 'Successfully added your review!');
  res.redirect(`/chargesites/${requestedChargesite._id}`);
}

// Delete review
module.exports.deleteReview = async(req, res) => {
  const { id, reviewId } = req.params;
  await Chargesite.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findById(reviewId);
  req.flash('success', 'Successfully deleted the review!');
  res.redirect(`/chargesites/${id}`);
}