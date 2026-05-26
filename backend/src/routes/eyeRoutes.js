const express = require('express');
const router = express.Router();
const eyeController = require('../controllers/eyeController');


/**
 * @swagger
 * /api/eye/summary/latest:
 *   get:
 *     summary: 최근 1분 안구 요약 데이터 조회
 *     tags: [Eye]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f123abc"
 *         description: 사용자 ID
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "session-1"
 *         description: 세션 ID
 *     responses:
 *       200:
 *         description: 최근 1분 요약 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "665f123abc"
 *                     sessionId:
 *                       type: string
 *                       example: "session-1"
 *                     blinkPerMinute:
 *                       type: number
 *                       example: 18
 *                     drowsyTimestamps:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: date-time
 *                       example:
 *                         - "2026-05-26T09:10:12.000Z"
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-26T09:10:00.000Z"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-26T09:11:00.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-26T09:11:00.000Z"
 *       500:
 *         description: 서버 에러
 */
router.get('/summary/latest', eyeController.getLatestEyeSummary);

/**
 * @swagger
 * /api/eye/data:
 *   post:
 *     summary: 안구 데이터 저장
 *     tags: [Eye]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "665f123abc"
 *               sessionId:
 *                 type: string
 *                 example: "session-1"
 *               windowDuration:
 *                 type: number
 *                 example: 2
 *               ear:
 *                 type: object
 *                 properties:
 *                   avg:
 *                     type: number
 *                     example: 0.23
 *                   min:
 *                     type: number
 *                     example: 0.18
 *                   max:
 *                     type: number
 *                     example: 0.30
 *               blink:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: number
 *                     example: 3
 *               drowsiness:
 *                 type: object
 *                 properties:
 *                   earBelowThresholdTime:
 *                     type: number
 *                     example: 0.8
 *                   isDrowsy:
 *                     type: boolean
 *                     example: false
 *     responses:
 *       201:
 *         description: 데이터 저장 성공
 *       500:
 *         description: 서버 에러
 */

router.post('/data', eyeController.receiveEyeData);

module.exports = router;
