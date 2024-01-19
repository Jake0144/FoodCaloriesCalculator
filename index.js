const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const Food = require('./models/food');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

//set ejs engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Get requests
app.get('/', (req, res) => {
    res.render('index');
  });
app.get('/create-new-food', (req, res) => {
    res.render('addFood');
  });
  app.get('/view-all-foods', async (req, res) => {
    try {
        const foods = await Food.find();
        console.log(foods); // Log the fetched data
        res.render('viewFoods', { foods });
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});
app.get('/view-all-food', (req, res) => {
    res.redirect('/view-all-foods');
  });
//Post requests
app.post('/api/add-food', (req,res)=>{
    const food = new Food(req.body);
    food.save()
    .then((result)=>{
      console.log(result);
      res.redirect('/');
    })
  });

<<<<<<< Updated upstream
=======

// Routes for authentication
app.get('/login', (req, res) => {
  res.render('login'); 
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

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
  const newUser = new User({ username, password });

  // Save the user to the database
  newUser.save((err) => {
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
  req.logout();
  res.redirect('/login');
});


>>>>>>> Stashed changes
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(()=> app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    }))
