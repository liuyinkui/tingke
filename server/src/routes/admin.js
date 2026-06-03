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
 * GET /api/admin/materials
 * 管理端查看全部素材（包含 draft）
 */
router.get('/materials', adminController.adminList);

/**
 * POST /api/admin/trigger-ingest
 * 手动触发素材流水线抓取
 */
router.post('/trigger-ingest', adminController.triggerIngest);

/**
 * GET /api/admin/stats
 * 整体数据大盘
 */
router.get('/stats', adminController.stats);

module.exports = router;
