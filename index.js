const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const Food = require('./models/food');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const dbURI = process.env.CYCLIC_DB;

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
app.get('/view-all-foods', (req, res) => {
    res.render('viewFoods');
  });
app.get('/view-food', (req, res) => {
    Food.find()
      .then((foods) => res.render('view-food', { foods }))
      .catch((err) => res.send(err));
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
  


// Connect to MongoDB
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(()=> app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    }))
