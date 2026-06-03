const path = require('path');
const fs = require('fs');
const db = require('../db');
const speechEval = require('../services/speechEvaluation');

// Multer will be configured in the route file for file upload handling

/**
 * POST /api/user/recording/submit
 * 提交跟读录音
 *
 * Body (multipart/form-data):
 *   - audio: recorded audio file
 *   - material_id: UUID
 *   - sentence_index: number (optional, whole material if omitted)
 *
 * Response:
 *   - score: overall pronunciation score (0-100)
 *   - details: per-word phoneme-level feedback
 */
async function submitRecording(req, res, next) {
  try {
    const userId = req.user.id;
    const { material_id, sentence_index } = req.body;
    const audioFile = req.file;

    if (!material_id) {
      const err = new Error('缺少 material_id');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    if (!audioFile) {
      const err = new Error('请上传录音文件');
      err.statusCode = 400;
      err.isOperational = true;
      return next(err);
    }

    // Fetch material for expected text
    const material = await db('materials').where({ id: material_id }).first();
    if (!material) {
      const err = new Error('素材不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    // Determine the expected text
    let expectedText = material.transcript;

    if (sentence_index !== undefined && sentence_index !== '') {
      const timeline =
        typeof material.sentence_timeline === 'string'
          ? JSON.parse(material.sentence_timeline)
          : material.sentence_timeline;

      const idx = parseInt(sentence_index, 10);
      if (!isNaN(idx) && idx >= 0 && idx < timeline.length) {
        expectedText = timeline[idx].text;
      }
    }

    // Evaluate via speech service
    const result = await speechEval.evaluate(audioFile.path, expectedText);

    // Move file to permanent storage
    const uploadDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(audioFile.originalname) || '.wav';
    const filename = `recording_${userId}_${Date.now()}${ext}`;
    const destPath = path.join(uploadDir, filename);

    // Copy (or move) the temp file to permanent location
    // Note: multer's disk storage already saved it
    fs.renameSync(audioFile.path, destPath);

    const audioUrl = `/uploads/${filename}`;

    // Store recording record
    const [record] = await db('recording_records')
      .insert({
        user_id: userId,
        material_id,
        audio_url: audioUrl,
        score: result.score,
        details: JSON.stringify(result.details),
      })
      .returning(['id', 'score', 'created_at']);

    res.json({
      success: true,
      data: {
        id: record.id,
        score: record.score,
        details: result.details,
        audio_url: audioUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/user/recording/:id/compare
 * 返回原声 + 用户录音的对比播放信息
 */
async function getCompare(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const record = await db('recording_records').where({ id, user_id: userId }).first();
    if (!record) {
      const err = new Error('录音记录不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    const material = await db('materials').where({ id: record.material_id }).first();
    if (!material) {
      const err = new Error('关联素材不存在');
      err.statusCode = 404;
      err.isOperational = true;
      return next(err);
    }

    res.json({
      success: true,
      data: {
        original_audio_url: material.audio_url,
        user_audio_url: record.audio_url,
        score: record.score,
        details: typeof record.details === 'string' ? JSON.parse(record.details) : record.details,
        transcript: material.transcript,
        recorded_at: record.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitRecording, getCompare };
