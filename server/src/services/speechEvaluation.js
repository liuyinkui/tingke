/**
 * Speech evaluation service.
 *
 * MVP阶段使用模拟评分，后续替换为真实API：
 * - 阿里云智能语音评测
 * - 腾讯云智聆 (GCloud)
 *
 * 切换方式：修改 evaluate() 中的 provider 调用
 */

// ── Mock evaluation ────────────────────────────────────────

/**
 * Mock phoneme-level evaluation.
 * Returns realistic-looking scores for development.
 */
function mockPhonemeScore(word, overallScore) {
  const phonemes = [];
  const chars = word.toLowerCase().split('');

  for (const char of chars) {
    if (/[a-z]/.test(char)) {
      // Each phoneme gets a score close to but not exactly the overall score
      const variance = Math.random() * 20 - 10;
      const phonemeScore = Math.max(40, Math.min(100, overallScore + variance));
      const suggestions = [];

      if (phonemeScore < 60) {
        suggestions.push('注意发音口型');
        if ('th'.includes(char)) suggestions.push('舌尖轻触上齿');
      } else if (phonemeScore < 75) {
        suggestions.push('可更清晰');
      }

      phonemes.push({
        phoneme: char,
        score: Math.round(phonemeScore),
        suggestions,
      });
    }
  }

  return phonemes;
}

/**
 * Evaluate a recording against the expected transcript.
 *
 * @param {string} audioPath - Path to the recorded audio file
 * @param {string} expectedText - The correct transcript text
 * @param {string} language - 'en-US' | 'en-GB'
 * @returns {Promise<{score: number, details: Array}>}
 */
async function evaluate(audioPath, expectedText, _language) {
  // ── Real API would go here ──────────────────────────
  //
  // 阿里云 SDK 示例:
  // const client = new SpeechEvaluationClient({
  //   accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  //   accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  // });
  // const result = await client.evaluate({
  //   audioFile: audioPath,
  //   text: expectedText,
  //   language,
  // });
  // return {
  //   score: result.pronunciationScore,
  //   details: result.phonemeDetails,
  // };
  // ────────────────────────────────────────────────────

  // Mock: generate scores based on a combination of:
  // - Deterministic hash of the text for consistency
  // - Random variance for realism
  const textHash = expectedText.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const baseScore = 45 + (textHash % 40); // 45-84 range
  const variance = Math.random() * 15 - 5; // -5 to +10
  const finalScore = Math.max(30, Math.min(100, baseScore + variance));

  // Generate per-word phoneme details
  const words = expectedText.split(/\s+/).filter(Boolean);
  const details = words.map((word) => ({
    word,
    score: Math.max(30, Math.min(100, finalScore + Math.random() * 20 - 10)),
    phonemes: mockPhonemeScore(word, finalScore),
  }));

  return {
    score: Math.round(finalScore),
    details,
  };
}

/**
 * Get service status message.
 */
function getStatus() {
  return {
    provider: 'mock',
    status: 'development',
    note: '使用模拟评分，接入阿里云/腾讯云后替换',
  };
}

module.exports = { evaluate, getStatus };
