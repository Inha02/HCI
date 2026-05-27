const ExerciseLog = require('../models/ExerciseLog');

exports.getExerciseLogs = async (req, res) => {
  try {
    const { userId, type } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (type) filter.type = type;

    const logs = await ExerciseLog.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createExerciseLog = async (req, res) => {
  try {
    const { userId, type, duration, success, score } = req.body;

    const log = await ExerciseLog.create({
      userId,
      type,
      duration,
      success,
      score,
    });

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};