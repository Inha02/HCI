const mongoose = require('mongoose');

const EyeSchema = new mongoose.Schema({
  userId: String,

  blinkCount: Number,
  earValue: Number,

  isDrowsy: Boolean,
  gazeStable: Boolean,

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Eye', EyeSchema);
