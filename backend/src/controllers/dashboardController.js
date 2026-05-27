const EyeMinuteSummary = require('../models/EyeSummary');
const ExerciseLog = require('../models/ExerciseLog');
const mongoose = require('mongoose');

const getDateRange = (period) => {
  const now = new Date();

  let startDate;

  if (period === 'day') {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    startDate = new Date(now);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate,
    endDate: now,
  };
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const { userId, period = 'day' } = req.query;

    const { startDate, endDate } = getDateRange(period);

    const eyeStats = await EyeMinuteSummary.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          avgBlinkPerMinute: { $avg: '$blinkPerMinute' },
          totalDrowsyCount: { $sum: '$drowsyCount' },
          measuredMinutes: { $sum: 1 },
        },
      },
    ]);

    const exerciseStats = await ExerciseLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$type',
          totalCount: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: ['$success', 1, 0],
            },
          },
          avgScore: { $avg: '$score' },
          totalDuration: { $sum: '$duration' },
        },
      },
    ]);

    const recentExercises = await ExerciseLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      period,
      range: {
        startDate,
        endDate,
      },
      eye: {
        avgBlinkPerMinute: eyeStats[0]?.avgBlinkPerMinute || 0,
        totalDrowsyCount: eyeStats[0]?.totalDrowsyCount || 0,
        measuredMinutes: eyeStats[0]?.measuredMinutes || 0,
      },
      exercise: {
        statsByType: exerciseStats,
        recentLogs: recentExercises,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};