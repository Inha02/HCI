const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: 대시보드 요약 데이터 조회
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "665f123abc"
 *         description: 사용자 ID
 *       - in: query
 *         name: period
 *         required: false
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         example: "day"
 *         description: 조회 기간
 *     responses:
 *       200:
 *         description: 대시보드 요약 데이터 조회 성공
 *       500:
 *         description: 서버 에러
 */
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;