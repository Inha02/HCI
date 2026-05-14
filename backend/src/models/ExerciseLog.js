const mongoose = require('mongoose');

const ExerciseLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  type: {
    type: String,
    enum: ['TRACKING', 'FOCUS', 'BLINK'],
  },

  duration: Number,

  success: Boolean,

  score: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ExerciseLog', ExerciseLogSchema);
