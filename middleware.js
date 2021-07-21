const Chargesite = require('./models/chargesite');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const { chargesiteSchema, reviewSchema } = require('./schemas'); // Joi validation schemas

// Middleware to validate chargesite using Joi schema
module.exports.validateChargesite = (req, res, next) => {
  // Validating chargesite using joi schema from the import
  const { error } = chargesiteSchema.validate(req.body);
  if(error){
    // Joining multiple error messages from Joi into one string
    const message = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(message, 400);
  } else {
    next();
  }
}

// Middleware to validate review using Joi schema
module.exports.validateReview = (req, res, next) => {
  // Validating review using joi schema from the import
  const { error } = reviewSchema.validate(req.body);
  if(error){
    // Joining multiple error messages from Joi into one string
    const message = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(message, 400);
  } else {
    next();
  }
}

// Middleware to verify if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    // Add returnTo url to session, from req.originalUrl
    // to return the user to the page where user was before login
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in to perform this action');
    return res.redirect('/login');
  }
  next();
}

// Middleware to verify if user is authorised
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const chargesite = await Chargesite.findById(id);
  if (!chargesite.author.equals(req.user._id)) {
    req.flash('error', 'Your are not authorized for this action');
    return res.redirect(`/chargesites/${id}`)
  }
  next();
}

// Middleware to verify if user has authorisation for a review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'Your are not authorized for this action');
    return res.redirect(`/chargesites/${id}`)
  }
  next();
}