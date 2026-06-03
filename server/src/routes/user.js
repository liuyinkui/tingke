const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// All profile routes require authentication
router.use(auth);

/**
 * GET /api/user/profile
 * 获取当前用户信息 + 学习统计
 */
router.get('/profile', profileController.getProfile);

/**
 * PATCH /api/user/profile
 * 更新用户设置（daily_goal, accent_pref, level）
 */
router.patch('/profile', profileController.updateProfile);

/**
 * GET /api/user/daily-material
 * 获取今日推荐素材
 */
router.get('/daily-material', profileController.getDailyMaterial);

module.exports = router;
