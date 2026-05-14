const express = require('express');
const router = express.Router();
const eyeController = require('../controllers/eyeController');

router.post('/data', eyeController.saveEyeData);

module.exports = router;
