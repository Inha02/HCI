const mongoose = require('mongoose');

const EyeSchema = new mongoose.Schema({
  /*
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
*/
  userId: String,

  sessionId: String,

  windowDuration: Number,

  ear: {
    avg: Number,
    min: Number,
    max: Number,
  },

  blink: {
    count: Number,
  },

  drowsiness: {
    earBelowThresholdTime: Number,
    isDrowsy: Boolean,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EyeData', EyeSchema);
