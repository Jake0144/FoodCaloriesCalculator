const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

const app = express();
const port = 3000;

//set ejs engine
app.set('view engine', 'ejs')

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
