const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const Food = require('./models/food');
const User = require('./models/user');
const Calories = require('./models/calories');
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

//Remove Food Request Handler
app.delete('/api/remove-food/:foodId', (req,res)=>{
  Food.findByIdAndDelete(req.params.foodId)
  .then((result)=>{
    console.log(result);
    res.redirect('/')
    })
});
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
app.get('/eat-food', async (req,res)=>{
  try {
    const foods = await Food.find({ user: req.user._id });
    console.log(foods);
    res.render('eatFood', { foods });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});
app.get('/api/get-all-foods', isLoggedIn, async (req, res) => {
  try {
      const foods = await Food.find({ user: req.user._id }, 'title');
      res.json(foods);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Post request for eat food
app.post('/api/eat-food/:foodId', isLoggedIn, async (req, res) => {
  try {
    const foodId = req.params.foodId;
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found.' });
    }

    // Calculate the total calories
    const totalCalories = food.calories;

    // Get the current date without the time
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's an existing record for the current date and user ID
    const existingRecord = await Calories.findOne({
      date: currentDate,
      user: req.user._id,
    });

    if (existingRecord) {
      // If a record exists, update it with the new total calories
      existingRecord.totalCalories += totalCalories;
      await existingRecord.save();
    } else {
      // If no record exists, create a new calorie record
      const calorieRecord = {
        totalCalories,
        date: currentDate,
        user: req.user._id,
      };

      // Save the new calorie record to the "calories" collection
      await Calories.create(calorieRecord);
    }

    // Chain the redirect to ensure it happens after the asynchronous operations
    res.status(200).json({ success: true, message: 'Food eaten successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error eating food.' });
  }
});
//Total Calories api for the main page 
app.get('/api/total-calories', isLoggedIn, async (req, res) => {
  try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); 
      const totalCalories = await Calories.aggregate([
          {
              $match: {
                  user: req.user._id,
                  date: { $gte: currentDate },
              },
          },
          {
              $group: {
                  _id: null,
                  totalCalories: { $sum: '$totalCalories' },
              },
          },
      ]);

      res.json({ totalCalories: totalCalories.length > 0 ? totalCalories[0].totalCalories : 0 });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error fetching total calories.' });
  }
});

// Post request to add new food
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
    res.redirect('/')
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(()=> app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    }))
