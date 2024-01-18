const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  mass: {
    type: Number,
    required: true
  }
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
