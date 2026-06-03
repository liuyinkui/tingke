const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint for monitoring and CI/CD.
 * Returns server status and current timestamp.
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
