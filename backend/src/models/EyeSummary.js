const mongoose = require('mongoose');

const EyeSummarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  sessionId: {
    type: String,
    required: true,
  },

  // 1분 동안의 눈 깜빡임 수
  blinkPerMinute: {
    type: Number,
    default: 0,
  },

  // 1분 동안 졸음이 감지된 횟수
  drowsyCount: {
    type: Number,
    default: 0,
    max: 1,
  },

  // 졸음이 감지된 시간들
  drowsyTimestamps: [
    {
      type: Date,
    },
  ],

  // 해당 1분 구간 시작 시간
  startTime: {
    type: Date,
    required: true,
  },

  // 해당 1분 구간 종료 시간
  endTime: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EyeSummary', EyeSummarySchema);