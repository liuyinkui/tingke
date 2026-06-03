const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const recordingController = require('../controllers/recordingController');

// All recording routes require authentication
router.use(auth);

// ── Multer config: temporary upload to system temp ────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/tingke-uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/x-wav',
      'audio/webm',
      'audio/ogg',
      'audio/x-m4a',
    ];
    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.match(/\.(wav|mp3|m4a|webm|ogg)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('不支持的音频格式'));
    }
  },
});

/**
 * POST /api/user/recording/submit
 * 提交跟读录音
 */
router.post('/submit', upload.single('audio'), recordingController.submitRecording);

/**
 * GET /api/user/recording/:id/compare
 * 原声 + 用户录音对比
 */
router.get('/:id/compare', recordingController.getCompare);

module.exports = router;
