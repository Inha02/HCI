const EyeSummary = require('../models/EyeSummary');

// 메모리에 임시 저장
const eyeBuffer = {};

exports.receiveEyeData = async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      blink,
      drowsiness,
    } = req.body;

    const key = `${userId}_${sessionId}`;

    if (!eyeBuffer[key]) {
      eyeBuffer[key] = {
        userId,
        sessionId,
        blinkTotal: 0,
        drowsyTimestamps: [],
        startTime: new Date(),
        lastSavedAt: Date.now(),
      };
    }

    // 2초마다 들어오는 blink count 누적
    eyeBuffer[key].blinkTotal += blink?.count || 0;

    // isDrowsy가 true일 때만 timestamp 저장
    if (drowsiness?.isDrowsy === true) {
      eyeBuffer[key].drowsyTimestamps.push(new Date());
      eyeBuffer[key].drowsyCount += 1;
    }

    const now = Date.now();

    // 1분이 지나면 DB에 요약 저장
    if (now - eyeBuffer[key].lastSavedAt >= 60 * 1000) {
      await EyeSummary.create({
        userId: eyeBuffer[key].userId,
        sessionId: eyeBuffer[key].sessionId,
        blinkPerMinute: eyeBuffer[key].blinkTotal,
        drowsyCount: eyeBuffer[key].drowsyTimestamps.length > 0 ? 1 : 0,
        drowsyTimestamps: eyeBuffer[key].drowsyTimestamps,
        startTime: eyeBuffer[key].startTime,
        endTime: new Date(),
      });

      // 저장 후 초기화
      eyeBuffer[key] = {
        userId,
        sessionId,
        blinkTotal: 0,
        drowsyCount: 0,
        drowsyTimestamps: [],
        startTime: new Date(),
        lastSavedAt: Date.now(),
      };
    }

    res.status(200).json({
      success: true,
      message: '데이터 수신 완료',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestEyeSummary = async (req, res) => {
  try {
    const { userId, sessionId } = req.query;

    const latestSummary = await EyeSummary.findOne({
      userId,
      sessionId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: latestSummary,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};