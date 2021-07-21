const Chargesite = require('../models/chargesite');
const { cloudinary } = require("../cloudinary");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
// Initializing MapBox
const geocoder = mbxGeoCoding({ accessToken: mapBoxToken });

// All chargesites
module.exports.index = async (_req, res) => {
  const chargesites = await Chargesite.find({});
  res.render('chargesites/index', { chargesites: chargesites });
}

// Create chargesite
module.exports.createChargesite = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: 'Surrey, BC',
    limit: 1,
  }).send();
  const newChargesite = new Chargesite(req.body);
  // Getting value from req.user created by passport after authentication
  newChargesite.author = req.user._id;
  // Getting images array from req.files
  // created by 'storage' multer middleware
  newChargesite.images = req.files.map(file => ({ url: file.path, filename: file.filename }))
  // Adding geoData from mapbox response in GeoJSON format
  newChargesite.geometry = geoData.body.features[0].geometry;
  await newChargesite.save();
  req.flash('success', 'Successfully made a new chargesite!');
  res.redirect(`/chargesites/${newChargesite._id}`);
}

// Render create chargesite form
module.exports.renderNewForm = (req, res) => {
  res.render('chargesites/new');
}

// Show chargesite by id
module.exports.showChargesite = async (req, res) => {
  const { id } = req.params;
  const requestedChargesite = await Chargesite
    .findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author' // Review author
      }
    })
    .populate('author'); // Chargesite author
  if(!requestedChargesite) {
    req.flash('error', 'Unable to find the requested chargesite!');
    return res.redirect('/chargesites');
  }
  res.render('chargesites/show', { chargesite: requestedChargesite});
}

// Edit chargesite by id
module.exports.editChargesite = async (req, res) => {
  const { id } = req.params;
  // using spread operator to spread the body and
  // pass it as the data to be updated in the database
  
  // OPTION - new: true 
  // - to return the updated data instead of data before update.
  
  // OPTION - useFindAndModify: false
  // - to handle the deprecation warning
  const updatedChargesite = await Chargesite.findByIdAndUpdate(id, { ...req.body }, { new: true, useFindAndModify: false });
  // Getting images array from req.files
  // created by 'storage' multer middleware
  const images = req.files.map(file => ({ url: file.path, filename: file.filename }));
  updatedChargesite.images.push(...images);
  await updatedChargesite.save();
  // Delete images if requested
  if (req.body.deleteImages) {
    // 
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    // 
    await updatedChargesite.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}})
  }

  req.flash('success', 'Successfully made changes to chargesite!');
  res.redirect(`/chargesites/${updatedChargesite._id}`);
}

// Render edit chargesite form by id
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const requestedChargesite = await Chargesite.findById(id);
  if(!requestedChargesite) {
    req.flash('error', 'Unable to find the requested chargesite!');
    return res.redirect('/chargesites');
  }
  res.render('chargesites/edit', { chargesite: requestedChargesite});
}

// Delete chargesite by id
module.exports.deleteChargesite = async (req, res) => {
  const { id } = req.params;
  await Chargesite.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted the chargesite!');
  res.redirect('/chargesites');
}