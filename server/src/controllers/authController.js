const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * POST /api/auth/register
 * 注册新用户（仅需昵称）
 */
async function register(req, res, next) {
  try {
    const { nickname } = req.body;

    if (!nickname || nickname.trim().length === 0) {
      const err = new Error('昵称不能为空');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    const trimmed = nickname.trim();

    // Check if nickname already exists
    const existing = await db('users').where({ nickname: trimmed }).first();
    if (existing) {
      const err = new Error('该昵称已被使用');
      err.statusCode = 409;
      err.isOperational = true;
      return next(err);
    }

    // Create user
    const [user] = await db('users')
      .insert({
        nickname: trimmed,
        first_checked_in_at: new Date().toISOString(),
      })
      .returning(['id', 'nickname', 'level', 'daily_goal', 'accent_pref', 'created_at']);

    // Generate JWT
    const token = jwt.sign({ id: user.id, nickname: user.nickname }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * 登录（仅需昵称）
 */
async function login(req, res, next) {
  try {
    const { nickname } = req.body;

    if (!nickname || nickname.trim().length === 0) {
      const err = new Error('请输入昵称');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    const trimmed = nickname.trim();

    const user = await db('users').where({ nickname: trimmed }).first();
    if (!user) {
      const err = new Error('用户不存在，请先注册');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, nickname: user.nickname }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          level: user.level,
          daily_goal: user.daily_goal,
          accent_pref: user.accent_pref,
          created_at: user.created_at,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
