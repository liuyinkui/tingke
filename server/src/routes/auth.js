const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/register
 * 注册新用户
 * Body: { nickname: string }
 * Response: { success, data: { token, user } }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * 登录
 * Body: { nickname: string }
 * Response: { success, data: { token, user } }
 */
router.post('/login', authController.login);

module.exports = router;
