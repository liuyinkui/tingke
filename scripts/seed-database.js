#!/usr/bin/env node

/**
 * Seed database — 将生成的素材写入数据库
 *
 * 用法:
 *   node scripts/seed-database.js
 *     → 生成素材并调用 Admin API 入库
 *
 *   node scripts/seed-database.js --api-url=http://localhost:3000
 *     → 指定 API 地址
 */

const { execSync } = require('child_process');
const path = require('path');

const API_URL = process.argv.find((a) => a.startsWith('--api-url='))?.split('=')[1] || 'http://localhost:3000';
const AUTH_TOKEN = process.env.TINGKE_AUTH_TOKEN || '';

async function main() {
  console.log('🌱 听刻 — 数据库种子\n');
  console.log(`   API: ${API_URL}`);
  console.log(`   Auth: ${AUTH_TOKEN ? '已配置' : '未配置 (跳过认证)'}\n`);

  // Step 1: Generate seed data
  console.log('📦 步骤1: 生成素材数据...');
  const seedPath = path.resolve(__dirname, 'materials/seed.json');

  try {
    execSync(`node "${path.resolve(__dirname, 'generate-seed.js')}" --save`, {
      stdio: 'inherit',
      cwd: __dirname,
    });
  } catch (err) {
    console.error('❌ 生成素材失败:', err.message);
    process.exit(1);
  }

  // Step 2: Read the seed data
  const fs = require('fs');
  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const materials = seedData.materials;

  console.log(`\n📤 步骤2: 入库 ${materials.length} 篇素材...`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const material of materials) {
    const authHeader = AUTH_TOKEN ? `-H "Authorization: Bearer ${AUTH_TOKEN}"` : '';
    // Try with a test admin token — for local dev, auth middleware won't pass
    // So we use a direct DB approach instead

    const cmd = `curl -s -w "\\n%{http_code}" -X POST "${API_URL}/api/admin/ingest" \
      ${authHeader} \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(material)}'`;

    try {
      const output = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
      const lines = output.trim().split('\n');
      const httpCode = parseInt(lines[lines.length - 1], 10);
      const body = lines.slice(0, -1).join('\n');

      if (httpCode === 201) {
        const result = JSON.parse(body);
        console.log(`  ✅ [${httpCode}] ${material.title} → ${result.data.id.slice(0, 8)}...`);
        success++;
      } else if (httpCode === 409) {
        console.log(`  ⏭️  [${httpCode}] ${material.title} — 已存在`);
        skipped++;
      } else {
        console.error(`  ❌ [${httpCode}] ${material.title}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ ${material.title}: ${err.message.slice(0, 100)}`);
      failed++;
    }
  }

  console.log(`\n📊 入库结果:`);
  console.log(`   成功: ${success}`);
  console.log(`   跳过: ${skipped}`);
  console.log(`   失败: ${failed}`);
  console.log(`  总计: ${materials.length}`);

  if (success > 0) {
    console.log(`\n✅ Seed 完成! 使用以下命令验证:`);
    console.log(`   curl ${API_URL}/api/materials | python3 -m json.tool`);
  }
}

main().catch((err) => {
  console.error('❌ Seed 失败:', err.message);
  process.exit(1);
});
