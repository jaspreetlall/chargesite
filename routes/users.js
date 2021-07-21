const express = require('express');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');

// Routes
router.route('/register')
  // GET Route - Render register form - new user
  .get(users.renderRegister)
  // POST Route - Create - new user
  .post(catchAsync(users.register))

router.route('/login')
  // GET Route - Render login form - returning user
  .get(users.renderLogin)
  // POST Route - Login - returning user
  // Authenticate takes care of loging the user in
  // automatically after successful authentication
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// GET Route - Logout
router.get('/logout', users.logout);

module.exports = router;