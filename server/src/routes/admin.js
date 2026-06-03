const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication
router.use(auth);

/**
 * POST /api/admin/ingest
 * 接收处理后的素材 JSON 并入库
 */
router.post('/ingest', adminController.ingest);

/**
 * GET /api/admin/stats
 * 素材库数据统计
 */
router.get('/stats', adminController.stats);

module.exports = router;
