const db = require('../db');
const { compareDictation } = require('../lib/normalize');

/**
 * POST /api/user/dictation/submit
 * 提交一句听写结果，返回逐词比对
 *
 * Body: { material_id, sentence_index, user_text }
 */
async function submitDictation(req, res, next) {
  try {
    const userId = req.user.id;
    const { material_id, sentence_index, user_text } = req.body;

    // Validation
    if (!material_id || sentence_index === undefined || user_text === undefined) {
      const err = new Error('缺少必填字段：material_id, sentence_index, user_text');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    // Fetch material
    const material = await db('materials').where({ id: material_id }).first();
    if (!material) {
      const err = new Error('素材不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    // Parse sentence timeline
    const timeline =
      typeof material.sentence_timeline === 'string'
        ? JSON.parse(material.sentence_timeline)
        : material.sentence_timeline;

    if (sentence_index < 0 || sentence_index >= timeline.length) {
      const err = new Error('句子索引无效');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    const expectedText = timeline[sentence_index].text;

    // Compare
    const result = compareDictation(user_text, expectedText);

    // Store dictation record
    const [record] = await db('dictation_records')
      .insert({
        user_id: userId,
        material_id,
        sentence_index,
        user_text: user_text.trim(),
        is_correct: result.accuracy >= 0.9, // >= 90% = pass
        errors: JSON.stringify(result.errors),
      })
      .returning('id');

    // Auto-add wrong words to user_words
    const wrongWords = result.errors
      .filter((e) => e.expected && e.expected.length > 0)
      .map((e) => ({
        word: e.expected,
        sentence: expectedText,
        material_id,
      }));

    if (wrongWords.length > 0) {
      // Upsert: avoid duplicates per user per word
      for (const w of wrongWords) {
        const existing = await db('user_words')
          .where({ user_id: userId, word: w.word.toLowerCase(), material_id })
          .first();
        if (!existing) {
          await db('user_words').insert({
            user_id: userId,
            ...w,
            word: w.word.toLowerCase(),
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        id: record.id,
        sentence_index,
        ...result,
        is_correct: result.accuracy >= 0.9,
        skipped_errors: result.errors.filter((e) => !e.received).length,
        wrong_errors: result.errors.filter((e) => e.received).length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/dictation/progress
 * 返回当前素材的听写进度
 *
 * Query: material_id
 */
async function getProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { material_id } = req.query;

    if (!material_id) {
      const err = new Error('缺少 material_id');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    // Get total sentence count from material
    const material = await db('materials').where({ id: material_id }).first();
    if (!material) {
      const err = new Error('素材不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    const timeline =
      typeof material.sentence_timeline === 'string'
        ? JSON.parse(material.sentence_timeline)
        : material.sentence_timeline;

    const totalSentences = timeline.length;

    // Get completed sentences for this user + material
    const records = await db('dictation_records')
      .where({ user_id: userId, material_id })
      .orderBy('sentence_index', 'asc');

    const completed = new Set(records.map((r) => r.sentence_index));
    const completedSentences = completed.size;

    // Calculate overall accuracy
    const totalAccuracy =
      records.length > 0
        ? records.reduce((sum, r) => {
            const errors = typeof r.errors === 'string' ? JSON.parse(r.errors) : r.errors || [];
            const errorCount = Array.isArray(errors) ? errors.length : 0;
            return sum + (r.user_text.split(/\s+/).filter(Boolean).length - errorCount);
          }, 0) /
          records.reduce((sum, r) => sum + r.user_text.split(/\s+/).filter(Boolean).length, 0)
        : 0;

    res.json({
      success: true,
      data: {
        material_id,
        total_sentences: totalSentences,
        completed_sentences: completedSentences,
        progress: totalSentences > 0 ? completedSentences / totalSentences : 0,
        overall_accuracy: Math.round(totalAccuracy * 100) / 100,
        completed_indices: Array.from(completed).sort((a, b) => a - b),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitDictation, getProgress };
