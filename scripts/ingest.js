#!/usr/bin/env node

/**
 * 素材处理脚本 — 听刻素材流水线
 *
 * 将原始素材（.mp3 + .txt）处理为带逐句时间轴的 JSON，
 * 并计算难度等级。
 *
 * 用法：
 *   node scripts/ingest.js <audio.mp3> <transcript.txt>
 *     → 输出处理后的 JSON 到 stdout
 *
 *   node scripts/ingest.js <audio.mp3> <transcript.txt> --save
 *     → 输出 JSON 到 scripts/materials/processed/<slug>.json
 *
 * 处理流程：
 *   1. 读取 .txt 转录文本
 *   2. 根据标点切分成句子
 *   3. 根据总时长 + 每句词数比例分配时间轴
 *   4. 计算难度等级（基于语速 + 词频）
 *   5. 输出结构化 JSON
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { estimateDifficulty, calculateWordRate } = require('./lib/difficulty');

// ── Helpers ────────────────────────────────────────────────

/**
 * Split text into sentences.
 * Handles common punctuation: . ! ? and line breaks.
 */
function splitSentences(text) {
  const clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .trim();

  // Split on sentence-ending punctuation, keeping the delimiter
  const parts = clean.match(/[^.!?]+[.!?]+/g);
  if (!parts || parts.length === 0) {
    // Fallback: split on line breaks or return whole text
    return clean.split(/\n+/).filter(Boolean).map((s) => s.trim());
  }

  return parts.map((s) => s.trim()).filter(Boolean);
}

/**
 * Get audio file duration using ffprobe.
 * Falls back to placeholder if ffprobe not available.
 */
function getAudioDurationMs(audioPath) {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    const seconds = parseFloat(output.trim());
    if (!isNaN(seconds) && seconds > 0) {
      return Math.round(seconds * 1000);
    }
  } catch {
    // ffprobe not available — this is expected in CI/dev environments
    // without ffmpeg installed
  }
  return null;
}

/**
 * Generate sentence timeline from transcript and audio duration.
 *
 * Strategy:
 * - If audio duration is known, distribute time proportionally by word count
 * - If not, estimate: assume ~150 words/min speaking rate
 */
function generateTimeline(sentences, durationMs) {
  const wordCounts = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const totalWords = wordCounts.reduce((a, b) => a + b, 0);

  // Estimate total duration if not provided: ~150 wpm speaking rate
  const estimatedDuration = durationMs || (totalWords / 150) * 60000;

  let currentMs = 0;
  const timeline = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentenceWords = wordCounts[i];
    // Each sentence gets time proportional to its word count
    const sentenceDuration =
      totalWords > 0
        ? Math.round((sentenceWords / totalWords) * estimatedDuration)
        : Math.round(estimatedDuration / sentences.length);

    // Add a small gap between sentences (200ms)
    const startMs = currentMs;
    const endMs = currentMs + sentenceDuration;

    timeline.push({
      index: i,
      start_ms: Math.round(startMs),
      end_ms: Math.round(endMs),
      text: sentences[i],
    });

    currentMs = endMs;
  }

  return { timeline, totalDurationMs: Math.round(estimatedDuration) };
}

/**
 * Extract topics from filename or content.
 */
function extractTopics(filename, transcript) {
  const topics = [];
  const lower = filename.toLowerCase();

  if (lower.includes('cet') || lower.includes('cet4') || lower.includes('cet-4')) topics.push('cet-4');
  if (lower.includes('cet6') || lower.includes('cet-6')) topics.push('cet-6');
  if (lower.includes('voa')) {
    topics.push('voa');
    if (lower.includes('slow') || lower.includes('special')) {
      topics.push('voa-slow');
    } else {
      topics.push('voa-standard');
    }
  }
  if (lower.includes('ted')) topics.push('ted');
  if (lower.includes('考研') || lower.includes('kaoyan')) topics.push('考研');

  return topics;
}

/**
 * Slugify filename for use as material identifier.
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Main ───────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const saveFlag = args.includes('--save');
  const files = args.filter((a) => !a.startsWith('--'));

  if (files.length < 2) {
    console.error(`
用法: node scripts/ingest.js <audio.mp3> <transcript.txt> [--save]

参数:
  audio.mp3         音频文件路径 (或音频时长秒数)
  transcript.txt    转录文本文件路径
  --save            保存输出到 scripts/materials/processed/

示例:
  node scripts/ingest.js ./sample.mp3 ./sample.txt
  node scripts/ingest.js ./sample.mp3 ./sample.txt --save
`);
    process.exit(1);
  }

  const audioPath = files[0];
  const transcriptPath = files[1];

  // Read transcript
  let transcript;
  try {
    transcript = fs.readFileSync(transcriptPath, 'utf8');
  } catch (err) {
    console.error(`❌ 无法读取转录文件: ${transcriptPath}`);
    process.exit(1);
  }

  // Determine if audioPath is an actual file or a duration placeholder
  const isActualAudio = fs.existsSync(audioPath);

  // Get audio duration
  let durationMs = null;
  if (isActualAudio) {
    try {
      durationMs = getAudioDurationMs(audioPath);
    } catch {
      // ignore
    }
  }

  // If audio is a number (seconds) or placeholder, use it directly
  if (!isNaN(parseFloat(audioPath)) && !durationMs) {
    durationMs = parseFloat(audioPath) * 1000;
  }

  // Split into sentences
  const sentences = splitSentences(transcript);
  if (sentences.length === 0) {
    console.error('❌ 无法从转录中切分出句子');
    process.exit(1);
  }

  // Generate timeline
  const { timeline, totalDurationMs } = generateTimeline(sentences, durationMs);

  // Calculate difficulty
  const wordRate = calculateWordRate(transcript, totalDurationMs);
  const difficulty = estimateDifficulty(transcript, wordRate);

  // Extract topics and generate identifiers
  const srcFilename = isActualAudio
    ? path.parse(audioPath).name
    : path.parse(transcriptPath).name;
  const topics = extractTopics(srcFilename, transcript);

  // Build output
  const slug = slugify(srcFilename);
  const title = srcFilename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const result = {
    title,
    slug,
    difficulty,
    duration: Math.round(totalDurationMs / 1000),
    audio_url: audioPath,
    transcript: transcript.trim(),
    sentence_timeline: timeline,
    word_list: null,
    topics,
    status: 'draft',
    metadata: {
      word_rate: wordRate,
      sentence_count: sentences.length,
      word_count: transcript.split(/\s+/).filter(Boolean).length,
      processed_at: new Date().toISOString(),
    },
  };

  // Output
  const output = JSON.stringify(result, null, 2);

  if (saveFlag) {
    const outDir = path.resolve(__dirname, 'materials/processed');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outPath = path.join(outDir, `${slug}.json`);
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`✅ 处理完成 → ${outPath}`);
  } else {
    console.log(output);
  }
}

main().catch((err) => {
  console.error('❌ 处理失败:', err.message);
  process.exit(1);
});
