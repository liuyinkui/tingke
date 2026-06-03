const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const materialController = require('../controllers/materialController');

/**
 * GET /api/materials
 * 公开素材列表（登录可选，登录后显示完成状态）
 */
router.get('/', auth, materialController.list);

/**
 * GET /api/materials/:id
 * 素材详情
 */
router.get('/:id', auth, materialController.detail);

module.exports = router;
