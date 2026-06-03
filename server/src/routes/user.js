const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const checkinController = require('../controllers/checkinController');
const wordController = require('../controllers/wordController');

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

/**
 * POST /api/user/checkin
 * 每日打卡
 */
router.post('/checkin', checkinController.checkin);

/**
 * GET /api/user/streak
 * 打卡 streak 数据
 */
router.get('/streak', checkinController.getStreak);

/**
 * GET /api/user/stats/summary
 * 学习统计概览
 */
router.get('/stats/summary', checkinController.getSummary);

/**
 * GET /api/user/words
 * 错词列表（按日期分组）
 */
router.get('/words', wordController.listWords);

/**
 * GET /api/user/words/stats
 * 错词统计
 */
router.get('/words/stats', wordController.wordStats);

/**
 * DELETE /api/user/words/:id
 * 标记单词为已掌握
 */
router.delete('/words/:id', wordController.removeWord);

module.exports = router;
