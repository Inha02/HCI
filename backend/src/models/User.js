const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,

  name: String,

  settings: {
    blinkThreshold: { type: Number, default: 0.2 },
    drowsyThresholdTime: { type: Number, default: 1.5 },
    notificationEnabled: { type: Boolean, default: true },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
