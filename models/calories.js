const mongoose = require('mongoose');
const moment = require('moment-timezone');

const caloriesSchema = new mongoose.Schema({
  totalCalories: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: function () {
      const userTimezone = this.user.timezone || 'UTC';
      
      return moment().tz(userTimezone).toDate();
    },
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Calories = mongoose.model('Calories', caloriesSchema);

module.exports = Calories;
