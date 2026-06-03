#!/usr/bin/env node

/**
 * 批量素材处理脚本
 *
 * 读取 scripts/materials/raw/ 目录下的原始素材，
 * 批量处理为 JSON 并（可选）通过 Admin API 入库。
 *
 * 用法：
 *   node scripts/batch-ingest.js
 *     → 处理 raw/ 下所有素材，输出到 processed/
 *
 *   node scripts/batch-ingest.js --publish
 *     → 处理并调用 Admin API 入库
 *
 *   node scripts/batch-ingest.js --api-url=http://localhost:3000
 *     → 指定 API 地址
 *
 * 素材文件约定：
 *   raw/
 *   ├── voa-slow-001.mp3
 *   ├── voa-slow-001.txt
 *   ├── cet4-001.mp3
 *   ├── cet4-001.txt
 *   └── ...
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RAW_DIR = path.resolve(__dirname, 'materials/raw');
const PROCESSED_DIR = path.resolve(__dirname, 'materials/processed');
const INGEST_SCRIPT = path.resolve(__dirname, 'ingest.js');

// ── Helpers ────────────────────────────────────────────────

/**
 * Find all .txt files in the raw directory and pair with .mp3 files.
 */
function findMaterialPairs(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 素材目录不存在: ${dir}`);
    console.error(`   请将 .mp3 + .txt 文件放入 ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir);
  const txtFiles = files.filter((f) => f.endsWith('.txt'));

  if (txtFiles.length === 0) {
    console.error(`❌ ${dir} 中没有 .txt 文件`);
    process.exit(1);
  }

  const pairs = [];
  for (const txt of txtFiles) {
    const baseName = txt.replace(/\.txt$/, '');
    const mp3 = files.find(
      (f) => f.replace(/\.(mp3|wav|m4a|ogg)$/, '') === baseName && /\.(mp3|wav|m4a|ogg)$/.test(f)
    );

    pairs.push({
      baseName,
      txt: path.join(dir, txt),
      mp3: mp3 ? path.join(dir, mp3) : null,
      hasAudio: mp3 !== null,
    });
  }

  return pairs;
}

/**
 * Process a single material pair using the ingest script.
 */
function processMaterial(pair, options) {
  const { baseName, txt, mp3, hasAudio } = pair;

  console.log(`\n📄 处理: ${baseName}`);

  // Use audio if available, otherwise pass duration estimate (and use transcript filename for slug)
  const audioArg = hasAudio ? mp3 : '30'; // default 30s if no audio

  try {
    const cmd = `node "${INGEST_SCRIPT}" "${audioArg}" "${txt}" --save`;
    const output = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    console.log(output.trim());
    return true;
  } catch (err) {
    console.error(`❌ 处理失败: ${baseName}`);
    console.error(`   ${err.message}`);
    return false;
  }
}

/**
 * Publish processed materials to the Admin API.
 */
async function publishMaterials(apiUrl) {
  if (!fs.existsSync(PROCESSED_DIR)) {
    console.error(`❌ 处理后的素材目录不存在: ${PROCESSED_DIR}`);
    return;
  }

  const jsonFiles = fs.readdirSync(PROCESSED_DIR).filter((f) => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.log('ℹ️  没有已处理的素材需要入库');
    return;
  }

  console.log(`\n📤 入库 ${jsonFiles.length} 篇素材到 ${apiUrl}...`);

  let success = 0;
  let failed = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(PROCESSED_DIR, file);
    const material = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    try {
      const response = execSync(
        `curl -s -X POST "${apiUrl}/api/admin/ingest" \
          -H "Content-Type: application/json" \
          -d '${JSON.stringify(material)}'`,
        { encoding: 'utf8', timeout: 15000 }
      );
      const result = JSON.parse(response);
      if (result.success) {
        console.log(`  ✅ ${file}`);
        success++;
      } else {
        console.error(`  ❌ ${file}: ${result.error?.message || '未知错误'}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 入库结果: ${success} 成功, ${failed} 失败`);
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const publish = args.includes('--publish');
  const apiUrlArg = args.find((a) => a.startsWith('--api-url='));
  const apiUrl = apiUrlArg ? apiUrlArg.split('=')[1] : 'http://localhost:3000';

  console.log('🎯 听刻 — 批量素材处理\n');
  console.log(`   原始素材: ${RAW_DIR}`);
  console.log(`   输出目录: ${PROCESSED_DIR}`);
  if (publish) console.log(`   入库 API: ${apiUrl}\n`);

  // Ensure processed directory exists
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  // Find material pairs
  const pairs = findMaterialPairs(RAW_DIR);
  console.log(`📦 找到 ${pairs.length} 篇素材 (${pairs.filter((p) => p.hasAudio).length} 篇含音频)\n`);

  // Process each pair
  let processed = 0;
  let skipped = 0;

  for (const pair of pairs) {
    const ok = processMaterial(pair);
    if (ok) processed++;
    else skipped++;
  }

  console.log(`\n📊 处理完成: ${processed} 成功, ${skipped} 失败`);

  // Publish if requested
  if (publish) {
    await publishMaterials(apiUrl);
  }

  console.log('\n✅ 批量处理结束\n');
}

main().catch((err) => {
  console.error('❌ 批量处理失败:', err.message);
  process.exit(1);
});
