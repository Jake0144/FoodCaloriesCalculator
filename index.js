const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const Food = require('./models/food');
const User = require('./models/user');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();
const port = 3000;

//set ejs engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Use session to track user login status
app.use(session({ secret: process.env.MY_SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//login protection
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redirect to login page if not authenticated
}


//Get requests
app.get('/',isLoggedIn, (req, res) => {
    res.render('index');
  });
app.get('/create-new-food',isLoggedIn, (req, res) => {
    res.render('addFood');
  });
app.get('/view-all-foods', isLoggedIn, async (req, res) => {
    try {
      const foods = await Food.find({ user: req.user._id });
      console.log(foods);
      res.render('viewFoods', { foods });
    } catch (err) {
      console.error(err);
      res.send(err);
    }
  });
app.get('/view-all-food', (req, res) => {
    res.redirect('/view-all-foods');
  });
//Post request to add new food
app.post('/api/add-food', isLoggedIn, async (req, res) => {
  try {
    const food = new Food({
      title: req.body.title,
      calories: req.body.calories,
      mass: req.body.mass,
      user: req.user._id, 
    });
    const result = await food.save();
    console.log(result);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

// Routes for authentication
app.get('/login', (req, res) => {
  res.render('login'); 
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), (req, res) => {
  req.session.save(() => {
    res.redirect('/');
  });
});

app.get('/register', (req, res) => {
  res.render('register'); 
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.render('register', { error: 'Username and password are required.' });
  }

// Create a new user
const newUser = new User({ username });

// Use the setPassword method provided by passport-local-mongoose to set the hashed password
User.register(newUser, password, (err, user) => {
  if (err) {
    console.error(err);
    return res.render('register', { error: 'Registration failed. Please try again.' });
  }

  // Automatically log in the user after registration
  passport.authenticate('local')(req, res, () => {
    res.redirect('/');
  });
});
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

// Delete food API
app.delete('/api/delete-food/:foodId', async (req, res) => {
  const { foodId } = req.params;

  try {
    const deletedFood = await Food.findByIdAndDelete(foodId);

    if (deletedFood) {
      res.json({ success: true, message: 'Food deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Food not found' });
    }
  } catch (err) {
    console.error('Error deleting food:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(()=> app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    }))
