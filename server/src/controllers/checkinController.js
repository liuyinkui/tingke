const db = require('../db');

/**
 * POST /api/user/checkin
 * 每日打卡
 */
async function checkin(req, res, next) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

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

    const lastCheckin = await db('checkins')
      .where({ user_id: userId })
      .orderBy('checkin_date', 'desc')
      .first();

    let streakCount = 1;

    if (lastCheckin) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastCheckin.checkin_date === yesterdayStr) {
        streakCount = (lastCheckin.streak_count || 0) + 1;
      }
    }

    const [record] = await db('checkins')
      .insert({
        user_id: userId,
        checkin_date: today,
        streak_count: streakCount,
      })
      .returning(['id', 'checkin_date', 'streak_count']);

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
 * 打卡 streak 数据
 */
async function getStreak(req, res, next) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const todayCheckin = await db('checkins')
      .where({ user_id: userId, checkin_date: today })
      .first();

    const allCheckins = await db('checkins')
      .where({ user_id: userId })
      .orderBy('checkin_date', 'desc');

    let longestStreak = 0;
    if (allCheckins.length > 0) {
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

    // Unmastered words
    const blindWords = await db('user_words')
      .where({ user_id: userId, is_mastered: false })
      .count('*')
      .first();
    const blindWordsCount = parseInt(blindWords?.count || '0', 10);

    // Mastered words
    const masteredWords = await db('user_words')
      .where({ user_id: userId, is_mastered: true })
      .count('*')
      .first();
    const masteredWordsCount = parseInt(masteredWords?.count || '0', 10);

    // Completed materials count
    const completedMaterials = await db('dictation_records')
      .where({ user_id: userId })
      .distinct('material_id');
    const completedCount = completedMaterials.length;

    // Checkin total
    const checkinTotal = await db('checkins').where({ user_id: userId }).count('*').first();
    const totalDays = parseInt(checkinTotal?.count || '0', 10);

    // Weekly minutes
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

    // Yesterday's accuracy
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

    const change =
      yesterdayAccuracy > 0 ? Math.round((todayAccuracy - yesterdayAccuracy) * 100) : null;

    res.json({
      success: true,
      data: {
        total_days: totalDays,
        weekly_minutes: weeklyMinutes,
        overall_accuracy: Math.round(avgAccuracy * 100),
        blind_words_count: blindWordsCount,
        mastered_words_count: masteredWordsCount,
        completed_materials: completedCount,
        today: {
          accuracy: Math.round(todayAccuracy * 100),
          words_correct: todayCorrect,
          words_total: todayTotal,
          change_vs_yesterday: change,
          completed: todayTotal > 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/stats/trend
 * 准确率变化趋势数据（用于折线图）
 * 返回近 N 天的每日准确率
 */
async function getAccuracyTrend(req, res, next) {
  try {
    const userId = req.user.id;
    const days = Math.min(parseInt(req.query.days || '30', 10), 90);
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const records = await db('dictation_records')
        .where({ user_id: userId })
        .whereRaw('DATE(created_at) = ?', [dateStr]);

      let correct = 0;
      let total = 0;
      for (const r of records) {
        const words = r.user_text.split(/\s+/).filter(Boolean).length;
        total += words;
        const errors = typeof r.errors === 'string' ? JSON.parse(r.errors) : r.errors || [];
        correct += words - errors.length;
      }

      result.push({
        date: dateStr,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
        words: total,
      });
    }

    res.json({ success: true, data: { trend: result } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/stats/comparison
 * 首次 vs 最近对比（第14天留存钩子）
 */
async function getComparison(req, res, next) {
  try {
    const userId = req.user.id;

    // Get first dictation record ever
    const firstRecord = await db('dictation_records')
      .where({ user_id: userId })
      .orderBy('created_at', 'asc')
      .first();

    // Get the most recent dictation record
    const lastRecord = await db('dictation_records')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .first();

    let firstAccuracy = null;
    let recentAccuracy = null;
    let improvement = null;

    if (firstRecord) {
      const words = firstRecord.user_text.split(/\s+/).filter(Boolean).length;
      const errors =
        typeof firstRecord.errors === 'string'
          ? JSON.parse(firstRecord.errors)
          : firstRecord.errors || [];
      firstAccuracy = words > 0 ? Math.round(((words - errors.length) / words) * 100) : 0;
    }

    if (lastRecord) {
      const words = lastRecord.user_text.split(/\s+/).filter(Boolean).length;
      const errors =
        typeof lastRecord.errors === 'string'
          ? JSON.parse(lastRecord.errors)
          : lastRecord.errors || [];
      recentAccuracy = words > 0 ? Math.round(((words - errors.length) / words) * 100) : 0;
    }

    if (firstAccuracy !== null && recentAccuracy !== null && firstAccuracy > 0) {
      improvement = Math.round(((recentAccuracy - firstAccuracy) / firstAccuracy) * 100);
    }

    // Days since first practice
    const daysSinceStart = firstRecord
      ? Math.round(
          (Date.now() - new Date(firstRecord.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    res.json({
      success: true,
      data: {
        first_accuracy: firstAccuracy,
        recent_accuracy: recentAccuracy,
        improvement,
        days_since_start: daysSinceStart,
        first_practice_date: firstRecord?.created_at || null,
        recent_practice_date: lastRecord?.created_at || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkin, getStreak, getSummary, getAccuracyTrend, getComparison };
