const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const errorHandler = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `路由 ${req.method} ${req.originalUrl} 不存在` },
  });
});

// ── Global error handler ───────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[听刻] 后端服务已启动 → http://localhost:${PORT}`);
  console.log(`[听刻] 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
