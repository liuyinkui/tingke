const db = require('../db');

/**
 * POST /api/user/checkin
 * 每日打卡
 * - 记录打卡日期
 * - 自动计算连续 streak 天数
 * - 保存用户首次打卡日期
 */
async function checkin(req, res, next) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if already checked in today
    const existing = await db('checkins').where({ user_id: userId, checkin_date: today }).first();

    if (existing) {
      return res.json({
        success: true,
        data: {
          already_checked_in: true,
          streak_count: existing.streak_count,
        },
      });
    }

    // Get last checkin to calculate streak
    const lastCheckin = await db('checkins')
      .where({ user_id: userId })
      .orderBy('checkin_date', 'desc')
      .first();

    let streakCount = 1;

    if (lastCheckin) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // If last checkin was yesterday, continue streak
      if (lastCheckin.checkin_date === yesterdayStr) {
        streakCount = (lastCheckin.streak_count || 0) + 1;
      }
      // If last checkin was today (already handled above) or earlier, streak restarts at 1
    }

    // Insert checkin
    const [record] = await db('checkins')
      .insert({
        user_id: userId,
        checkin_date: today,
        streak_count: streakCount,
      })
      .returning(['id', 'checkin_date', 'streak_count']);

    // Update user's first_checked_in_at if not set
    await db('users').where({ id: userId }).whereNull('first_checked_in_at').update({
      first_checked_in_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: {
        already_checked_in: false,
        id: record.id,
        checkin_date: record.checkin_date,
        streak_count: streakCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/streak
 * 返回打卡 streak 数据
 */
async function getStreak(req, res, next) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get current streak
    const todayCheckin = await db('checkins')
      .where({ user_id: userId, checkin_date: today })
      .first();

    // Get all checkins ordered by date
    const allCheckins = await db('checkins')
      .where({ user_id: userId })
      .orderBy('checkin_date', 'desc');

    // Calculate longest streak
    let longestStreak = 0;
    if (allCheckins.length > 0) {
      // Sort ascending for streak calculation
      const sorted = [...allCheckins].sort(
        (a, b) => new Date(a.checkin_date).getTime() - new Date(b.checkin_date).getTime()
      );

      let currentRun = 1;
      longestStreak = 1;
      for (let i = 1; i < sorted.length; i++) {
        const prevDate = new Date(sorted[i - 1].checkin_date);
        const currDate = new Date(sorted[i].checkin_date);
        const diffDays = Math.round(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          currentRun++;
          longestStreak = Math.max(longestStreak, currentRun);
        } else {
          currentRun = 1;
        }
      }
    }

    const user = await db('users').where({ id: userId }).select('first_checked_in_at').first();

    res.json({
      success: true,
      data: {
        current_streak: todayCheckin?.streak_count || 0,
        longest_streak: longestStreak,
        total_days: allCheckins.length,
        today_checked_in: !!todayCheckin,
        first_checkin_date: user?.first_checked_in_at || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/stats/summary
 * 学习统计概览
 */
async function getSummary(req, res, next) {
  try {
    const userId = req.user.id;

    // Total dictation accuracy
    const dictationRecords = await db('dictation_records')
      .where({ user_id: userId })
      .select('user_text', 'errors');

    let totalCorrect = 0;
    let totalWords = 0;

    for (const r of dictationRecords) {
      const words = r.user_text.split(/\s+/).filter(Boolean).length;
      totalWords += words;
      const errors = typeof r.errors === 'string' ? JSON.parse(r.errors) : r.errors || [];
      totalCorrect += words - errors.length;
    }

    const avgAccuracy = totalWords > 0 ? totalCorrect / totalWords : 0;

    // Blind zone words count (unmastered user_words)
    const blindWords = await db('user_words')
      .where({ user_id: userId, is_mastered: false })
      .count('*')
      .first();
    const blindWordsCount = parseInt(blindWords?.count || '0', 10);

    // Completed materials count
    const completedMaterials = await db('dictation_records')
      .where({ user_id: userId })
      .distinct('material_id');
    const completedCount = completedMaterials.length;

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = await db('dictation_records')
      .where({ user_id: userId })
      .whereRaw('DATE(created_at) = ?', [today]);

    let todayCorrect = 0;
    let todayTotal = 0;
    for (const r of todayRecords) {
      const words = r.user_text.split(/\s+/).filter(Boolean).length;
      todayTotal += words;
      const errors = typeof r.errors === 'string' ? JSON.parse(r.errors) : r.errors || [];
      todayCorrect += words - errors.length;
    }
    const todayAccuracy = todayTotal > 0 ? todayCorrect / todayTotal : 0;

    // Yesterday's accuracy (for comparison)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayRecords = await db('dictation_records')
      .where({ user_id: userId })
      .whereRaw('DATE(created_at) = ?', [yesterdayStr]);

    let yesterdayCorrect = 0;
    let yesterdayTotal = 0;
    for (const r of yesterdayRecords) {
      const words = r.user_text.split(/\s+/).filter(Boolean).length;
      yesterdayTotal += words;
      const errors = typeof r.errors === 'string' ? JSON.parse(r.errors) : r.errors || [];
      yesterdayCorrect += words - errors.length;
    }
    const yesterdayAccuracy = yesterdayTotal > 0 ? yesterdayCorrect / yesterdayTotal : 0;

    // Change vs yesterday (percentage points)
    const change =
      yesterdayAccuracy > 0 ? Math.round((todayAccuracy - yesterdayAccuracy) * 100) : null;

    res.json({
      success: true,
      data: {
        overall_accuracy: Math.round(avgAccuracy * 100),
        blind_words_count: blindWordsCount,
        completed_materials: completedCount,
        today: {
          accuracy: Math.round(todayAccuracy * 100),
          words_correct: todayCorrect,
          words_total: todayTotal,
          change_vs_yesterday: change,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkin, getStreak, getSummary };
