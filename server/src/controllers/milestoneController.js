const db = require('../db');

/**
 * POST /api/user/milestone/check
 * 检查用户是否处于里程碑日
 *
 * Returns:
 *   days_count: 从 first_checked_in_at 到现在的天数
 *   is_milestone: 是否是里程碑日
 *   milestone_type: 'day7' | 'day14' | 'day30' | null
 *   streak_days: 当前连续打卡天数
 *   upcoming_milestone: 下一个里程碑及还需天数
 */
async function checkMilestone(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await db('users')
      .where({ id: userId })
      .select('first_checked_in_at', 'created_at')
      .first();
    if (!user) {
      const err = new Error('用户不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    const startDate = user.first_checked_in_at || user.created_at;
    const start = new Date(startDate);
    const now = new Date();

    // Calculate days (floor — only full days count)
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / msPerDay);

    // Milestone days
    const milestones = [7, 14, 21, 30, 60, 100];
    const isMilestone = milestones.includes(daysSinceStart);

    const getMilestoneType = (days) => {
      if (days === 7) return 'day7';
      if (days === 14) return 'day14';
      if (days === 21) return 'day21';
      if (days === 30) return 'day30';
      if (days === 60) return 'day60';
      if (days === 100) return 'day100';
      return null;
    };

    // Find upcoming milestone
    let upcomingMilestone = null;
    for (const m of milestones) {
      if (m > daysSinceStart) {
        upcomingMilestone = { days: m, remaining: m - daysSinceStart, type: getMilestoneType(m) };
        break;
      }
    }

    // Get current streak
    const today = now.toISOString().split('T')[0];
    const todayCheckin = await db('checkins')
      .where({ user_id: userId, checkin_date: today })
      .first();

    res.json({
      success: true,
      data: {
        days_since_first_practice: daysSinceStart,
        is_milestone: isMilestone,
        milestone_type: getMilestoneType(daysSinceStart),
        milestone_day: isMilestone ? daysSinceStart : null,
        streak_days: todayCheckin?.streak_count || 0,
        upcoming_milestone: upcomingMilestone,
        first_practice_date: startDate,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkMilestone };
