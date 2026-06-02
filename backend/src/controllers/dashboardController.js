const EyeMinuteSummary = require('../models/EyeSummary');
const ExerciseLog = require('../models/ExerciseLog');
const mongoose = require('mongoose');

const KOREA_TIMEZONE = 'Asia/Seoul';

const getDateRange = (period) => {
  const now = new Date();

  let startDate;
  let endDate = new Date(now);

  if (period === 'day') {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  } 
  
  else if (period === 'week') {
    startDate = new Date(now);

    const day = startDate.getDay(); // 일:0, 월:1
    const diff = day === 0 ? 6 : day - 1;

    startDate.setDate(startDate.getDate() - diff);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } 
  
  else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  } 
  
  else {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  }

  return {
    startDate,
    endDate,
  };
};

const getChartConfig = (period) => {
  let labels;
  let groupExpression;

  if (period === 'day') {
    labels = ['오전', '오후', '야간'];

    groupExpression = {
      $switch: {
        branches: [
          {
            case: {
              $lt: [
                {
                  $hour: {
                    date: '$startTime',
                    timezone: KOREA_TIMEZONE,
                  },
                },
                12,
              ],
            },
            then: '오전',
          },
          {
            case: {
              $lt: [
                {
                  $hour: {
                    date: '$startTime',
                    timezone: KOREA_TIMEZONE,
                  },
                },
                18,
              ],
            },
            then: '오후',
          },
        ],
        default: '야간',
      },
    };
  }

  else if (period === 'week') {
    labels = ['월', '화', '수', '목', '금', '토', '일'];

    groupExpression = {
      $arrayElemAt: [
        ['일', '월', '화', '수', '목', '금', '토'],
        {
          $subtract: [
            {
              $dayOfWeek: {
                date: '$startTime',
                timezone: KOREA_TIMEZONE,
              },
            },
            1,
          ],
        },
      ],
    };
  }

  else if (period === 'month') {
    labels = ['1주차', '2주차', '3주차', '4주차', '5주차'];

    groupExpression = {
      $concat: [
        {
          $toString: {
            $ceil: {
              $divide: [
                {
                  $dayOfMonth: {
                    date: '$startTime',
                    timezone: KOREA_TIMEZONE,
                  },
                },
                7,
              ],
            },
          },
        },
        '주차',
      ],
    };
  }

  return {
    labels,
    groupExpression,
  };
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const { userId, period = 'day' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId가 필요합니다.',
      });
    }

    if (!['day', 'week', 'month'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'period는 day, week, month 중 하나여야 합니다.',
      });
    }

    const { startDate, endDate } = getDateRange(period);
    const { labels, groupExpression } = getChartConfig(period);


    const eyeStats = await EyeMinuteSummary.aggregate([
      {
        $match: {
          userId: userId,
          startTime: {
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

    const chartStats = await EyeMinuteSummary.aggregate([
      {
        $match: {
          userId: userId,
          startTime: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: groupExpression,
          avgBlink: { $avg: '$blinkPerMinute' },
          totalDrowsy: { $sum: '$drowsyCount' },
        },
      },
      {
        $project: {
          _id: 0,
          label: '$_id',
          avgBlink: { $round: ['$avgBlink', 1] },
          totalDrowsy: 1,
        },
      },
    ]);

    const bpmChart = labels.map((label) => {
      const found = chartStats.find((item) => item.label === label);

      return {
        label,
        value: found ? found.avgBlink : 0,
      };
    });

    const drowsyChart = labels.map((label) => {
      const found = chartStats.find((item) => item.label === label);

      return {
        label,
        value: found ? found.totalDrowsy : 0,
      };
    });

    const exerciseStats = await ExerciseLog.aggregate([
      {
        $match: {
          userId: userId,
          startTime: {
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
      userId: userId,
      startTime: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ startTime: -1 })
      .limit(10);

    return res.status(200).json({
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

      bpmChart,
      drowsyChart,

      exercise: {
        statsByType: exerciseStats,
        recentLogs: recentExercises,
      },
    });
  } catch (err) {
    console.error('대시보드 요약 조회 에러:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};