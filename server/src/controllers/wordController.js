const db = require('../db');

/**
 * GET /api/user/words
 * 错词列表 — 按日期分组
 * 支持分页
 */
async function listWords(req, res, next) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, mastered } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(parseInt(limit, 10), 100);
    const pageLimit = Math.min(Math.max(1, parseInt(limit, 10)), 100);

    let query = db('user_words').where({ user_id: userId });
    let countQuery = db('user_words').where({ user_id: userId });

    // Filter by mastered status
    if (mastered === 'true') {
      query = query.andWhere('is_mastered', true);
      countQuery = countQuery.andWhere('is_mastered', true);
    } else if (mastered === 'false' || mastered === undefined) {
      query = query.andWhere('is_mastered', false);
      countQuery = countQuery.andWhere('is_mastered', false);
    }

    const countResult = await countQuery.count('*').first();
    const total = parseInt(countResult?.count || '0', 10);

    let words = await query
      .select('id', 'word', 'sentence', 'is_mastered', 'created_at', 'material_id')
      .orderBy('created_at', 'desc')
      .limit(pageLimit)
      .offset(offset);

    // Group by date
    const grouped = words.reduce((acc, w) => {
      const date = new Date(w.created_at).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(w);
      return acc;
    }, {});

    // Sort dates descending
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    res.json({
      success: true,
      data: {
        words: grouped,
        dates: sortedDates,
        pagination: {
          page: Math.max(1, parseInt(page, 10)),
          limit: pageLimit,
          total,
          total_pages: Math.ceil(total / pageLimit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/user/words/:id
 * 标记单词为"已掌握"
 */
async function removeWord(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const word = await db('user_words').where({ id, user_id: userId }).first();
    if (!word) {
      const err = new Error('单词不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    await db('user_words').where({ id }).update({ is_mastered: true });

    res.json({ success: true, data: { id, word: word.word, is_mastered: true } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/words/stats
 * 错词统计
 */
async function wordStats(req, res, next) {
  try {
    const userId = req.user.id;

    const total = await db('user_words').where({ user_id: userId }).count('*').first();
    const mastered = await db('user_words')
      .where({ user_id: userId, is_mastered: true })
      .count('*')
      .first();
    const unmastered = await db('user_words')
      .where({ user_id: userId, is_mastered: false })
      .count('*')
      .first();

    res.json({
      success: true,
      data: {
        total: parseInt(total?.count || '0', 10),
        mastered: parseInt(mastered?.count || '0', 10),
        unmastered: parseInt(unmastered?.count || '0', 10),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listWords, removeWord, wordStats };
