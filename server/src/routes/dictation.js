const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dictationController = require('../controllers/dictationController');

// All dictation routes require authentication
router.use(auth);

/**
 * POST /api/user/dictation/submit
 * 提交一句听写结果
 */
router.post('/submit', dictationController.submitDictation);

/**
 * GET /api/user/dictation/progress
 * 返回当前素材的听写进度
 */
router.get('/progress', dictationController.getProgress);

module.exports = router;
