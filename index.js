const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');


const app = express();
const port = 3000;

//set ejs engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.render('index');
  });


//start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
