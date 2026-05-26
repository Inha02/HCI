const mongoose = require('mongoose');

const EyeSummarySchema = new mongoose.Schema({
  userId: String,
  sessionId: String,

  blinkPerMinute: {
    type: Number,
    default: 0,
  },

  drowsyTimestamps: [
    {
      type: Date,
    },
  ],

  startTime: Date,
  endTime: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EyeSummary', EyeSummarySchema);