const express = require('express');
const router = express.Router();
const chargesites = require('../controllers/chargesites')
const catchAsync = require('../utils/catchAsync');
const { validateChargesite, isLoggedIn, isAuthor } = require('../middleware');
// Handle file uploads via form using multer
const multer = require('multer');
// Create 'storage' to be used as destination for multer
const { storage } = require('../cloudinary'); 
const upload = multer({ storage });

// Routes
router.route('/')
  // GET Route - Render all chargesites
  .get(catchAsync(chargesites.index))
  // POST Route - Create - new chargesite
  .post(isLoggedIn, upload.array('images'), validateChargesite, catchAsync(chargesites.createChargesite))

// GET Route - Render form - new chargesite
router.get('/new', isLoggedIn, chargesites.renderNewForm);

router.route('/:id')
  // GET Route - Render details - by chargesite id
  .get(catchAsync(chargesites.showChargesite))
  // PUT Route - Edit - by chargesite id
  .put(isLoggedIn, isAuthor, upload.array('images'), validateChargesite, catchAsync(chargesites.editChargesite))
  // DELETE Route - Delete - by chargesite id
  .delete(isLoggedIn, isAuthor, catchAsync(chargesites.deleteChargesite));

// GET Route - Render form - edit chargesite
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(chargesites.renderEditForm));

module.exports = router;