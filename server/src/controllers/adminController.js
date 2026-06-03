const db = require('../db');

/**
 * POST /api/admin/ingest
 * 接收处理后的素材 JSON 并入库
 */
async function ingest(req, res, next) {
  try {
    const {
      title,
      difficulty,
      duration,
      audio_url,
      transcript,
      sentence_timeline,
      word_list,
      topics,
      status,
    } = req.body;

    if (!title || !difficulty || !audio_url || !transcript || !sentence_timeline) {
      const err = new Error(
        '缺少必填字段：title, difficulty, audio_url, transcript, sentence_timeline'
      );
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    if (!['L1', 'L2', 'L3', 'L4', 'L5'].includes(difficulty)) {
      const err = new Error('难度等级无效，必须是 L1~L5');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    if (!Array.isArray(sentence_timeline) || sentence_timeline.length === 0) {
      const err = new Error('sentence_timeline 必须是包含至少一条句子的数组');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    for (const sentence of sentence_timeline) {
      if (
        typeof sentence.start_ms !== 'number' ||
        typeof sentence.end_ms !== 'number' ||
        !sentence.text
      ) {
        const err = new Error('sentence_timeline 每项必须包含 start_ms, end_ms, text');
        err.statusCode = 400;
        err.isOperational = true;
        return next(err);
      }
    }

    const existing = await db('materials').where({ title }).first();
    if (existing) {
      const err = new Error(`素材"${title}"已存在`);
      err.statusCode = 409;
      err.isOperational = true;
      return next(err);
    }

    const [material] = await db('materials')
      .insert({
        title,
        difficulty,
        duration:
          duration ||
          Math.round(sentence_timeline.reduce((sum, s) => sum + (s.end_ms - s.start_ms), 0) / 1000),
        audio_url,
        transcript,
        sentence_timeline: JSON.stringify(sentence_timeline),
        word_list: word_list ? JSON.stringify(word_list) : null,
        topics: topics || [],
        status: status || 'draft',
      })
      .returning(['id', 'title', 'difficulty', 'duration', 'status', 'created_at']);

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/materials
 * 管理端查看全部素材（包含 draft）
 */
async function adminList(req, res, next) {
  try {
    const { difficulty, status, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(parseInt(limit, 10), 100);
    const pageLimit = Math.min(Math.max(1, parseInt(limit, 10)), 100);

    let query = db('materials');
    let countQuery = db('materials');

    if (difficulty && ['L1', 'L2', 'L3', 'L4', 'L5'].includes(difficulty)) {
      query = query.andWhere('difficulty', difficulty);
      countQuery = countQuery.andWhere('difficulty', difficulty);
    }

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query = query.andWhere('status', status);
      countQuery = countQuery.andWhere('status', status);
    }

    const countResult = await countQuery.count('*').first();
    const total = parseInt(countResult?.count || '0', 10);

    const materials = await query
      .select('id', 'title', 'difficulty', 'duration', 'topics', 'status', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(pageLimit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        materials,
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
 * POST /api/admin/trigger-ingest
 * 手动触发素材流水线抓取
 * （实际应用中会触发异步任务，当前为占位）
 */
async function triggerIngest(req, res, next) {
  try {
    // In production, this would trigger the VAD pipeline async
    // For now, placeholder that confirms the endpoint works
    res.json({
      success: true,
      data: {
        message: '抓取任务已触发',
        note: '当前为占位实现，实际 VAD 处理将调用 scripts/ingest.js',
        triggered_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/stats
 * 整体数据大盘
 */
async function stats(req, res, next) {
  try {
    const materialTotal = await db('materials').count('*').first();
    const userTotal = await db('users').count('*').first();

    // Active users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await db('checkins')
      .where('created_at', '>=', sevenDaysAgo)
      .countDistinct('user_id')
      .first();

    const byDifficulty = await db('materials')
      .select('difficulty')
      .count('* as count')
      .groupBy('difficulty')
      .orderBy('difficulty');

    const byStatus = await db('materials').select('status').count('* as count').groupBy('status');

    res.json({
      success: true,
      data: {
        total_materials: parseInt(materialTotal?.count || '0', 10),
        total_users: parseInt(userTotal?.count || '0', 10),
        active_users_7d: parseInt(activeUsers?.count || '0', 10),
        by_difficulty: byDifficulty,
        by_status: byStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { ingest, adminList, triggerIngest, stats };
