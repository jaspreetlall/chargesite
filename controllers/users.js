const User = require('../models/user');

// Render register form
module.exports.renderRegister = (req, res) => {
  res.render('users/register');
}

// Create user
module.exports.register = async (req, res) => {
  // Handling errors here to give better feedback when they occur
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    // Loging in the user right after registering
    // Does not happen automatically like passport.authenticate()
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Chargesite!');
      res.redirect('/chargesites');
    })
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
}

// Render login form
module.exports.renderLogin = (req, res) => {
  res.render('users/login');
}

// Login user
module.exports.login = (req, res) => {
  req.flash('success', 'Welcome Back');
  const redirectUrl = req.session.returnTo || '/chargesites';
  // Delete the returnTo from session after creating our redirectUrl variable
  delete req.session.returnTo;
  // Redirecting the user to previous url or /chargesites
  res.redirect(redirectUrl);
}

// Logout user
module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'See you later!');
  res.redirect('/chargesites');
}