/**
 * Knex configuration — 数据库连接配置
 * 使用环境变量控制，支持开发/生产多环境
 */
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const commonConfig = {
  client: 'pg',
  migrations: {
    directory: path.resolve(__dirname, 'src/db/migrations'),
    extension: 'js',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: path.resolve(__dirname, 'src/db/seeds'),
    extension: 'js',
    loadExtensions: ['.js'],
  },
  pool: {
    min: 2,
    max: 10,
  },
};

module.exports = {
  development: {
    ...commonConfig,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'tingke_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
  },

  production: {
    ...commonConfig,
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    },
  },
};
