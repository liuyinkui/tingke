const db = require('../db');

/**
 * GET /api/user/profile
 * 返回当前用户信息 + 学习统计
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      const err = new Error('用户不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    const checkinResult = await db('checkins').where({ user_id: userId }).count('*').first();
    const totalDays = parseInt(checkinResult?.count || '0', 10);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekRecords = await db('dictation_records')
      .join('materials', 'dictation_records.material_id', 'materials.id')
      .where('dictation_records.user_id', userId)
      .where('dictation_records.created_at', '>=', weekStart)
      .distinct('dictation_records.material_id')
      .sum('materials.duration as total');

    const weeklyMinutes = Math.round(parseInt(weekRecords[0]?.total || '0', 10) / 60);

    const latestCheckin = await db('checkins')
      .where({ user_id: userId })
      .orderBy('checkin_date', 'desc')
      .first();

    res.json({
      success: true,
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        daily_goal: user.daily_goal,
        accent_pref: user.accent_pref,
        total_days: totalDays,
        weekly_minutes: weeklyMinutes,
        current_streak: latestCheckin?.streak_count || 0,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/user/profile
 * 更新用户设置
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { daily_goal, accent_pref, level } = req.body;

    const updates = {};

    if (daily_goal !== undefined) {
      const validGoals = [15, 30, 45];
      if (!validGoals.includes(daily_goal)) {
        const err = new Error('每日目标只能是 15、30 或 45 分钟');
        err.statusCode = 400;
        err.isOperational = true;
        return next(err);
      }
      updates.daily_goal = daily_goal;
    }

    if (accent_pref !== undefined) {
      const validAccents = ['us', 'uk'];
      if (!validAccents.includes(accent_pref)) {
        const err = new Error('口音偏好只能是 us（美音）或 uk（英音）');
        err.statusCode = 400;
        err.isOperational = true;
        return next(err);
      }
      updates.accent_pref = accent_pref;
    }

    if (level !== undefined) {
      const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
      if (!validLevels.includes(level)) {
        const err = new Error('水平等级只能是 L1~L5');
        err.statusCode = 400;
        err.isOperational = true;
        return next(err);
      }
      updates.level = level;
    }

    if (Object.keys(updates).length === 0) {
      const err = new Error('没有需要更新的字段');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    updates.updated_at = new Date().toISOString();

    const [updated] = await db('users')
      .where({ id: userId })
      .update(updates)
      .returning(['id', 'nickname', 'level', 'daily_goal', 'accent_pref']);

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/daily-material
 * 获取今日推荐素材
 * 优先推荐未练过 + 同等级素材
 */
async function getDailyMaterial(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      const err = new Error('用户不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    // Get completed material IDs
    const completedRows = await db('dictation_records')
      .where({ user_id: userId })
      .distinct('material_id');
    const completedIds = completedRows.map((r) => r.material_id);

    let material = null;

    // 1) Try uncompleted material at user's level
    if (completedIds.length > 0) {
      material = await db('materials')
        .where({ difficulty: user.level, status: 'published' })
        .whereNotIn('id', completedIds)
        .orderByRaw('RANDOM()')
        .first();
    } else {
      material = await db('materials')
        .where({ difficulty: user.level, status: 'published' })
        .orderByRaw('RANDOM()')
        .first();
    }

    // 2) Fallback: any uncompleted published material
    if (!material && completedIds.length > 0) {
      material = await db('materials')
        .where({ status: 'published' })
        .whereNotIn('id', completedIds)
        .orderByRaw('RANDOM()')
        .first();
    }

    // 3) Last resort: any published material at all
    if (!material) {
      material = await db('materials')
        .where({ status: 'published' })
        .orderByRaw('RANDOM()')
        .first();
    }

    if (!material) {
      const err = new Error('暂时没有可用的素材');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    const result = {
      ...material,
      sentence_timeline:
        typeof material.sentence_timeline === 'string'
          ? JSON.parse(material.sentence_timeline)
          : material.sentence_timeline,
      word_list:
        material.word_list && typeof material.word_list === 'string'
          ? JSON.parse(material.word_list)
          : material.word_list,
      completed: completedIds.includes(material.id),
    };

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, getDailyMaterial };
