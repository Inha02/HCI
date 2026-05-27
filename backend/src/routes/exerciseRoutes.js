const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

/**
 * @swagger
 * /api/exercise/logs:
 *   get:
 *     summary: 안구 운동 기록 목록 조회
 *     tags: [Exercise]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         example: "665f123abc"
 *         description: 사용자 ID
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [TRACKING, FOCUS, BLINK]
 *         example: "BLINK"
 *         description: 운동 종류
 *     responses:
 *       200:
 *         description: 운동 기록 조회 성공
 *       500:
 *         description: 서버 에러
 */
router.get('/logs', exerciseController.getExerciseLogs);

/**
 * @swagger
 * /api/exercise/logs:
 *   post:
 *     summary: 안구 운동 기록 저장
 *     tags: [Exercise]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "665f123abc"
 *               type:
 *                 type: string
 *                 enum: [TRACKING, FOCUS, BLINK]
 *                 example: "BLINK"
 *               duration:
 *                 type: number
 *                 example: 60
 *               success:
 *                 type: boolean
 *                 example: true
 *               score:
 *                 type: number
 *                 example: 85
 *     responses:
 *       201:
 *         description: 운동 기록 저장 성공
 *       500:
 *         description: 서버 에러
 */
router.post('/logs', exerciseController.createExerciseLog);

module.exports = router;