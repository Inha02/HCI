const express = require('express');
const router = express.Router();
const eyeController = require('../controllers/eyeController');

router.post('/data', eyeController.saveEyeData);

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

module.exports = router;
