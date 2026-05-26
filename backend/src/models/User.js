const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // 일반 로그인용
  email: {
    type: String,
    unique: true,
    sparse: true,
  },

  password: {
    type: String,
  },

  // 서비스에서 사용할 이름
  name: {
    type: String,
  },

  // 카카오 로그인용
  socialType: {
    type: String,
    enum: ['kakao', 'local'],
    default: 'local',
  },

  socialId: {
    type: String,
    unique: true,
    sparse: true,
  },

  profileImage: {
    type: String,
    default: '',
  },

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