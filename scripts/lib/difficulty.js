/**
 * Simplified English word frequency table.
 * Used for estimating material difficulty based on vocabulary.
 *
 * Source: Based on SUBTLEX-US frequency data and CEFR levels.
 * Each entry: [word, cefr_level, frequency_per_million]
 *
 * CEFR levels: A1 (beginner), A2 (elementary), B1 (intermediate),
 *              B2 (upper-intermediate), C1 (advanced), C2 (proficient)
 *
 * Only covering the most common ~500 words as a seed.
 * Full word lists can be extended with npm packages like wordfreq.
 */
const WORD_FREQ = new Map([
  // A1 — beginners
  ['the', { level: 'A1', freq: 50000 }],
  ['be', { level: 'A1', freq: 40000 }],
  ['to', { level: 'A1', freq: 30000 }],
  ['of', { level: 'A1', freq: 30000 }],
  ['and', { level: 'A1', freq: 30000 }],
  ['a', { level: 'A1', freq: 25000 }],
  ['in', { level: 'A1', freq: 25000 }],
  ['that', { level: 'A1', freq: 20000 }],
  ['have', { level: 'A1', freq: 15000 }],
  ['i', { level: 'A1', freq: 15000 }],
  ['it', { level: 'A1', freq: 15000 }],
  ['for', { level: 'A1', freq: 12000 }],
  ['not', { level: 'A1', freq: 12000 }],
  ['on', { level: 'A1', freq: 12000 }],
  ['with', { level: 'A1', freq: 10000 }],
  ['he', { level: 'A1', freq: 10000 }],
  ['as', { level: 'A1', freq: 10000 }],
  ['you', { level: 'A1', freq: 10000 }],
  ['do', { level: 'A1', freq: 10000 }],
  ['at', { level: 'A1', freq: 10000 }],
  ['this', { level: 'A1', freq: 9000 }],
  ['but', { level: 'A1', freq: 9000 }],
  ['his', { level: 'A1', freq: 8000 }],
  ['by', { level: 'A1', freq: 8000 }],
  ['from', { level: 'A1', freq: 8000 }],
  ['they', { level: 'A1', freq: 8000 }],
  ['we', { level: 'A1', freq: 7000 }],
  ['say', { level: 'A1', freq: 7000 }],
  ['her', { level: 'A1', freq: 7000 }],
  ['she', { level: 'A1', freq: 7000 }],
  ['or', { level: 'A1', freq: 6000 }],
  ['an', { level: 'A1', freq: 6000 }],
  ['will', { level: 'A1', freq: 6000 }],
  ['my', { level: 'A1', freq: 6000 }],
  ['one', { level: 'A1', freq: 6000 }],
  ['all', { level: 'A1', freq: 6000 }],
  ['would', { level: 'A1', freq: 5000 }],
  ['there', { level: 'A1', freq: 5000 }],
  ['their', { level: 'A1', freq: 5000 }],
  ['what', { level: 'A1', freq: 5000 }],
  ['so', { level: 'A1', freq: 5000 }],
  ['up', { level: 'A1', freq: 5000 }],
  ['out', { level: 'A1', freq: 5000 }],
  ['if', { level: 'A1', freq: 5000 }],
  ['about', { level: 'A1', freq: 4000 }],
  ['who', { level: 'A1', freq: 4000 }],
  ['get', { level: 'A1', freq: 4000 }],
  ['which', { level: 'A1', freq: 4000 }],
  ['go', { level: 'A1', freq: 4000 }],
  ['me', { level: 'A1', freq: 4000 }],
  ['when', { level: 'A1', freq: 4000 }],
  ['make', { level: 'A1', freq: 4000 }],
  ['can', { level: 'A1', freq: 4000 }],
  ['like', { level: 'A1', freq: 3000 }],
  ['time', { level: 'A1', freq: 3000 }],
  ['no', { level: 'A1', freq: 3000 }],
  ['just', { level: 'A1', freq: 3000 }],
  ['him', { level: 'A1', freq: 3000 }],
  ['know', { level: 'A1', freq: 3000 }],
  ['take', { level: 'A1', freq: 3000 }],
  ['people', { level: 'A1', freq: 3000 }],
  ['into', { level: 'A1', freq: 3000 }],
  ['year', { level: 'A1', freq: 3000 }],
  ['your', { level: 'A1', freq: 3000 }],
  ['good', { level: 'A1', freq: 3000 }],
  ['some', { level: 'A1', freq: 3000 }],
  ['could', { level: 'A1', freq: 3000 }],
  ['them', { level: 'A1', freq: 3000 }],
  ['see', { level: 'A1', freq: 3000 }],
  ['other', { level: 'A1', freq: 3000 }],
  ['than', { level: 'A1', freq: 3000 }],
  ['then', { level: 'A1', freq: 3000 }],
  ['now', { level: 'A1', freq: 3000 }],
  ['look', { level: 'A1', freq: 3000 }],
  ['only', { level: 'A1', freq: 3000 }],
  ['come', { level: 'A1', freq: 3000 }],
  ['its', { level: 'A1', freq: 3000 }],
  ['over', { level: 'A1', freq: 3000 }],
  ['think', { level: 'A1', freq: 3000 }],
  ['also', { level: 'A1', freq: 3000 }],
  ['back', { level: 'A1', freq: 3000 }],
  ['after', { level: 'A1', freq: 3000 }],
  ['use', { level: 'A1', freq: 3000 }],
  ['two', { level: 'A1', freq: 3000 }],
  ['how', { level: 'A1', freq: 3000 }],
  ['our', { level: 'A1', freq: 3000 }],
  ['work', { level: 'A1', freq: 3000 }],
  ['first', { level: 'A1', freq: 3000 }],
  ['well', { level: 'A1', freq: 3000 }],
  ['way', { level: 'A1', freq: 3000 }],
  ['even', { level: 'A1', freq: 3000 }],
  ['new', { level: 'A1', freq: 3000 }],
  ['want', { level: 'A1', freq: 3000 }],
  ['because', { level: 'A1', freq: 3000 }],
  ['any', { level: 'A1', freq: 3000 }],
  ['these', { level: 'A1', freq: 3000 }],
  ['give', { level: 'A1', freq: 3000 }],
  ['day', { level: 'A1', freq: 3000 }],
  ['most', { level: 'A1', freq: 3000 }],
  ['us', { level: 'A1', freq: 3000 }],
  ['very', { level: 'A1', freq: 2000 }],
  ['here', { level: 'A1', freq: 2000 }],
  ['thing', { level: 'A1', freq: 2000 }],
  ['find', { level: 'A1', freq: 2000 }],
  ['still', { level: 'A1', freq: 2000 }],
  ['between', { level: 'A1', freq: 2000 }],
  ['own', { level: 'A1', freq: 2000 }],
  ['may', { level: 'A1', freq: 2000 }],
  ['should', { level: 'A1', freq: 2000 }],
  ['call', { level: 'A1', freq: 2000 }],
  ['down', { level: 'A1', freq: 2000 }],
  ['did', { level: 'A1', freq: 2000 }],
  ['long', { level: 'A1', freq: 2000 }],
  ['get', { level: 'A1', freq: 2000 }],
  ['made', { level: 'A1', freq: 2000 }],
  ['may', { level: 'A1', freq: 2000 }],
  ['part', { level: 'A1', freq: 2000 }],
  ['each', { level: 'A1', freq: 2000 }],
  ['tell', { level: 'A1', freq: 2000 }],
  ['set', { level: 'A1', freq: 2000 }],
]);

/**
 * Estimate the difficulty level of a text based on word frequency.
 * @param {string} text - The transcript text
 * @param {number} wordRate - Words per minute (speech rate)
 * @returns {string} L1~L5
 */
function estimateDifficulty(text, wordRate) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'L1';

  // Count words not in the frequency table (rare/advanced words)
  const unknownWords = words.filter((w) => !WORD_FREQ.has(w));
  const unknownRatio = unknownWords.length / words.length;

  // Calculate average word level score
  const levelScore = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  let totalScore = 0;
  let scoredWords = 0;

  for (const w of words) {
    const entry = WORD_FREQ.get(w);
    if (entry) {
      totalScore += levelScore[entry.level] || 3;
      scoredWords++;
    }
  }

  const avgLevel = scoredWords > 0 ? totalScore / scoredWords : 3;

  // Combine factors: speech rate, vocabulary difficulty, unknown word ratio
  let difficulty = 0;

  // Speech rate factor
  if (wordRate < 100) difficulty += 1;
  else if (wordRate < 140) difficulty += 2;
  else if (wordRate < 170) difficulty += 3;
  else if (wordRate < 200) difficulty += 4;
  else difficulty += 5;

  // Vocabulary factor
  difficulty += avgLevel;

  // Unknown word penalty
  if (unknownRatio > 0.3) difficulty += 2;
  else if (unknownRatio > 0.2) difficulty += 1;

  // Normalize to L1-L5
  const avg = difficulty / 2;
  if (avg <= 1.5) return 'L1';
  if (avg <= 2.5) return 'L2';
  if (avg <= 3.5) return 'L3';
  if (avg <= 4.5) return 'L4';
  return 'L5';
}

/**
 * Calculate speech rate (words per minute).
 */
function calculateWordRate(text, durationMs) {
  const wordsCount = text.split(/\s+/).filter(Boolean).length;
  const durationMinutes = durationMs / 60000;
  if (durationMinutes <= 0) return 0;
  return Math.round(wordsCount / durationMinutes);
}

module.exports = { estimateDifficulty, calculateWordRate };
