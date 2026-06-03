const db = require('../db');

/**
 * POST /api/admin/ingest
 * 接收处理后的素材 JSON 并入库
 * Body: { title, difficulty, duration, audio_url, transcript, sentence_timeline, word_list?, topics, status }
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

    // Validation
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

    // Validate sentence_timeline format
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

    // Check for duplicate by title
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

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/stats
 * 素材库数据统计
 */
async function stats(req, res, next) {
  try {
    const total = await db('materials').count('*').first();
    const byDifficulty = await db('materials')
      .select('difficulty')
      .count('* as count')
      .groupBy('difficulty')
      .orderBy('difficulty');
    const byStatus = await db('materials').select('status').count('* as count').groupBy('status');

    res.json({
      success: true,
      data: {
        total: parseInt(total?.count || '0', 10),
        by_difficulty: byDifficulty,
        by_status: byStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { ingest, stats };
