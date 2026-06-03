/**
 * Text normalization utilities for dictation comparison.
 *
 * Handles:
 * - Case folding
 * - Contraction expansion (don't → do not)
 * - Punctuation tolerance
 * - Whitespace normalization
 */

// Common English contractions and their expansions
const CONTRACTIONS = {
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "couldn't": 'could not',
  "shouldn't": 'should not',
  "can't": 'cannot',
  cannot: 'cannot',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "haven't": 'have not',
  "hasn't": 'has not',
  "hadn't": 'had not',
  "mustn't": 'must not',
  "needn't": 'need not',
  "mightn't": 'might not',
  "it's": 'it is',
  "that's": 'that is',
  "what's": 'what is',
  "who's": 'who is',
  "where's": 'where is',
  "when's": 'when is',
  "why's": 'why is',
  "how's": 'how is',
  "there's": 'there is',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "let's": 'let us',
  "i'm": 'i am',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "i've": 'i have',
  "you've": 'you have',
  "we've": 'we have',
  "they've": 'they have',
  "i'll": 'i will',
  "you'll": 'you will',
  "he'll": 'he will',
  "she'll": 'she will',
  "it'll": 'it will',
  "we'll": 'we will',
  "they'll": 'they will',
  "i'd": 'i would',
  "you'd": 'you would',
  "he'd": 'he would',
  "she'd": 'she would',
  "we'd": 'we would',
  "they'd": 'they would',
};

/**
 * Normalize a single word for comparison.
 * Lowercases, strips surrounding punctuation, expands contractions.
 */
function normalizeWord(word) {
  let normalized = word
    .toLowerCase()
    .trim()
    // Strip leading/trailing punctuation
    .replace(/^[^a-z0-9']+/, '')
    .replace(/[^a-z0-9']+$/, '');

  if (!normalized) return '';

  // Expand contractions
  if (CONTRACTIONS[normalized]) {
    return CONTRACTIONS[normalized];
  }

  // Handle possessive 's
  if (normalized.endsWith("'s")) {
    return normalized; // keep as-is for now
  }

  return normalized;
}

/**
 * Tokenize a sentence into words.
 * Handles punctuation separation.
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Normalize a full sentence for comparison.
 * Returns array of normalized words.
 */
function normalizeSentence(text) {
  const tokens = tokenize(text);
  return tokens.map(normalizeWord).filter((w) => w.length > 0);
}

/**
 * Compare user input against expected text.
 * Returns detailed word-by-word comparison.
 *
 * @param {string} userText - The user's dictation input
 * @param {string} expectedText - The correct transcript
 * @returns {Object} Comparison result
 */
function compareDictation(userText, expectedText) {
  const userWords = normalizeSentence(userText);
  const expectedTokens = tokenize(expectedText);
  const expectedWords = normalizeSentence(expectedText);

  const maxLen = Math.max(expectedWords.length, userWords.length);
  const correct = [];
  const user = [];
  const errors = [];

  let exactMatchCount = 0;

  for (let i = 0; i < maxLen; i++) {
    const expected = expectedWords[i] || null;
    const userWord = userWords[i] || null;
    const expectedRaw = expectedTokens[i] || '';

    const isCorrect = expected !== null && userWord !== null && expected === userWord;

    if (isCorrect) exactMatchCount++;

    correct.push(expected || null);
    user.push(userWord);

    if (!isCorrect) {
      errors.push({
        index: i,
        expected: expectedRaw,
        received: userWord,
      });
    }
  }

  const totalWords = expectedWords.length;
  const accuracy = totalWords > 0 ? exactMatchCount / totalWords : 0;

  return {
    correct,
    user,
    errors,
    accuracy: Math.round(accuracy * 100) / 100,
    total_words: totalWords,
    correct_count: exactMatchCount,
  };
}

module.exports = { normalizeWord, tokenize, normalizeSentence, compareDictation };
