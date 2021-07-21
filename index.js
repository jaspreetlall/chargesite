if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const User = require('./models/user');
const chargesiteRoutes = require('./routes/chargesites');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// Using environment variables in production
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/chargesite';
const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const port = process.env.PORT || 3000;

// Mongo Setup
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

// Handling connection errors - Mongoose
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => console.log("Database connected"));

const app = express();

// EJS requirements
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// EJS Template Engine
app.engine('ejs', ejsMate);

// Parse the body from the form submission
// for POST request
app.use(express.urlencoded({extended: true}));
// Override for handling form requests (method)
// such as put, patch
app.use(methodOverride('_method'));
// Serving public directory
app.use(express.static(path.join(__dirname, 'public')));
// Preventing Mongo Injection (SQL injection like) attacks
app.use(mongoSanitize());
// Configuring MongoDb session store
// Must happen before session sonfiguration
const store = MongoStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60, // Lazy session update after 1 day, in seconds
  crypto: {
    secret: secret,
  }
})

store.on("error", function(e) {
  console.log("Session store error", e);
})
// Initialize session with config
const sessionConfig = {
  store,
  name: 'session', // Changed default name of the session, default is connect.sid
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, // Makes cookies work only over https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}
app.use(session(sessionConfig));

// Using helmet add security headers
// Pass { contentSecurityPolicy: false } to disable same origin
// app.use(helmet({ contentSecurityPolicy: false }));

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/jsl/", 
        "https://images.unsplash.com/",
        "https://source.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Initializing passport.js
app.use(passport.initialize());
// Passport middleware for persistent login sessions
// Also ensure 'session' is initialized before passport sessions
app.use(passport.session());
// Passport uses a strategy and authenticates user
// using authentication method on the user model
passport.use(new LocalStrategy(User.authenticate()));
// Storing and retreiving user info in and from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Setting up flash to flash messages
app.use(flash());
// Making flash messages & user info accessible to any views rendered
// with any request http://expressjs.com/en/api.html#res.locals
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// Using imported routes with applicable prefixes
app.use('/', userRoutes);
app.use('/chargesites', chargesiteRoutes);
app.use('/chargesites/:id/reviews', reviewRoutes);

// Routes
// GET Route - Render homepage
app.get('/', (_req, res) => {
  res.render('home');
})

// Catching any route request of all types
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

app.listen(port, ()=> {
  console.log(`Listening on port ${port}`)
})