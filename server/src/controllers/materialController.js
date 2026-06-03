const db = require('../db');

/**
 * GET /api/materials
 * 公开素材列表 — 只返回已发布的素材
 * 支持筛选：difficulty, topic
 * 支持分页：page, limit
 * 返回简要信息 + 用户完成状态
 */
async function list(req, res, next) {
  try {
    const { difficulty, topic, page = 1, limit = 20 } = req.query;
    const userId = req.user?.id;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const pageLimit = Math.min(Math.max(1, parseInt(limit, 10)), 100);

    let query = db('materials').where('status', 'published');
    let countQuery = db('materials').where('status', 'published');

    // Filter by difficulty
    if (difficulty && ['L1', 'L2', 'L3', 'L4', 'L5'].includes(difficulty)) {
      query = query.andWhere('difficulty', difficulty);
      countQuery = countQuery.andWhere('difficulty', difficulty);
    }

    // Filter by topic (using array containment)
    if (topic) {
      query = query.andWhereRaw('? = ANY(topics)', [topic]);
      countQuery = countQuery.andWhereRaw('? = ANY(topics)', [topic]);
    }

    // Get total count
    const countResult = await countQuery.count('*').first();
    const total = parseInt(countResult?.count || '0', 10);

    // Fetch paginated results
    const materials = await query
      .select('id', 'title', 'difficulty', 'duration', 'topics', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(pageLimit)
      .offset(offset);

    // If user is authenticated, check completion status
    let completedIds = new Set();
    if (userId && materials.length > 0) {
      const completed = await db('dictation_records')
        .where('user_id', userId)
        .whereIn(
          'material_id',
          materials.map((m) => m.id)
        )
        .distinct('material_id');
      completedIds = new Set(completed.map((r) => r.material_id));
    }

    const result = materials.map((m) => ({
      ...m,
      completed: completedIds.has(m.id),
    }));

    res.json({
      success: true,
      data: {
        materials: result,
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
 * GET /api/materials/:id
 * 素材详情 — 包含完整信息和 sentence_timeline
 */
async function detail(req, res, next) {
  try {
    const { id } = req.params;

    const material = await db('materials').where({ id }).andWhere('status', 'published').first();

    if (!material) {
      const err = new Error('素材不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    // Parse JSON fields
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
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail };
