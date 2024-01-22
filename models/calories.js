const mongoose = require('mongoose');

const caloriesSchema = new mongoose.Schema({
  totalCalories: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const Calories = mongoose.model('Calories', caloriesSchema);

module.exports = Calories;
