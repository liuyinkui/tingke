import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StepIndicator from '../components/StepIndicator';
import { MaterialDetail } from '../services/materials';
import { submitDictation } from '../services/dictation';

interface Props {
  material: MaterialDetail;
  audioUrl?: string;
  onComplete: () => void;
  onExit: () => void;
}

type WordStatus = 'pending' | 'correct' | 'error' | 'blank';

interface WordResult {
  text: string;
  status: WordStatus;
  correction?: string;
}

const STEP_LABELS = ['盲听', '听写', '跟读'];

export default function DictationScreen({ material, onComplete, onExit }: Props) {
  const timeline = material.sentence_timeline || [];

  // Current sentence being typed
  const [sentenceIndex, setSentenceIndex] = useState(0);
  // Current input word (user types one word at a time)
  const [currentInput, setCurrentInput] = useState('');
  // Words user has typed for current sentence
  const [typedWords, setTypedWords] = useState<string[]>([]);
  // Results for completed sentences
  const [sentenceResults, setSentenceResults] = useState<Map<number, WordResult[]>>(new Map());
  // Whether current sentence has been submitted
  const [submitted, setSubmitted] = useState(false);
  // Loading state
  const [submitting, setSubmitting] = useState(false);
  // All sentences completed
  const [allDone, setAllDone] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const currentSentence = timeline[sentenceIndex];
  const expectedWords = currentSentence?.text.split(/\s+/) || [];

  // Check if the word at the given index has been checked already
  const getWordStatus = useCallback(
    (wordIndex: number): { status: WordStatus; correction?: string } => {
      if (!submitted) return { status: 'pending' };

      const sentResult = sentenceResults.get(sentenceIndex);
      if (!sentResult || !sentResult[wordIndex]) return { status: 'pending' };

      return sentResult[wordIndex];
    },
    [submitted, sentenceIndex, sentenceResults]
  );

  // Handle word input submission (user presses space or submit)
  const handleWordSubmit = useCallback(() => {
    const trimmed = currentInput.trim();
    if (!trimmed || submitted) return;

    setTypedWords((prev) => [...prev, trimmed]);
    setCurrentInput('');
  }, [currentInput, submitted]);

  // Handle backspace on empty input = remove last word
  const handleBackspace = useCallback(() => {
    if (currentInput.length === 0 && typedWords.length > 0 && !submitted) {
      setTypedWords((prev) => prev.slice(0, -1));
    }
  }, [currentInput, typedWords, submitted]);

  // Submit the current sentence for evaluation
  const handleSubmitSentence = useCallback(async () => {
    if (submitted || submitting) return;

    const userText = typedWords.join(' ');
    if (!userText.trim()) {
      Alert.alert('提示', '请输入至少一个词');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitDictation(material.id, sentenceIndex, userText);

      // Build word results
      const wordResults: WordResult[] = expectedWords.map((expected, i) => {
        const isCorrect = result.correct[i] !== null && result.user[i] !== null;
        const isBlank = result.user[i] === null;

        if (isCorrect) {
          return { text: expected, status: 'correct' };
        } else if (isBlank) {
          return {
            text: expected,
            status: 'blank',
            correction: expected,
          };
        } else {
          return {
            text: expected,
            status: 'error',
            correction: expected,
          };
        }
      });

      setSentenceResults((prev) => {
        const next = new Map(prev);
        next.set(sentenceIndex, wordResults);
        return next;
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || '提交失败';
      Alert.alert('提交失败', msg);
    } finally {
      setSubmitting(false);
    }
  }, [submitted, submitting, typedWords, material.id, sentenceIndex, expectedWords]);

  // Move to next sentence or complete
  const handleNextSentence = useCallback(() => {
    if (sentenceIndex < timeline.length - 1) {
      setSentenceIndex((i) => i + 1);
      setTypedWords([]);
      setCurrentInput('');
      setSubmitted(false);
      inputRef.current?.focus();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      setAllDone(true);
    }
  }, [sentenceIndex, timeline.length]);

  // Re-listen to current sentence
  const handleReplay = useCallback(() => {
    // The AudioPlayer will handle seeking if we pass sentence_timeline
    // For now, focus the input
    inputRef.current?.focus();
  }, []);

  // Complete dictation and proceed
  const handleProceed = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Render word tokens for current sentence
  const renderWordTokens = () => {
    if (!currentSentence) return null;

    return (
      <View style={styles.wordGrid}>
        {expectedWords.map((word, i) => {
          const { status, correction } = getWordStatus(i);
          const hasTyped = i < typedWords.length;
          const isCurrentInput = i === typedWords.length && !submitted;

          // Background and text color based on status
          let bgColor = 'transparent';
          let textColor = '#2D3436';
          let borderBottomColor = '#DFE6E9';

          if (submitted) {
            if (status === 'correct') {
              bgColor = '#E8F8F5';
              textColor = '#00B894';
            } else if (status === 'error') {
              bgColor = '#FFF5F5';
              textColor = '#FF6B6B';
            } else if (status === 'blank') {
              bgColor = '#F5F7FA';
              textColor = '#B2BEC3';
            }
          } else if (isCurrentInput) {
            borderBottomColor = '#1E3A5F';
          }

          return (
            <View key={i} style={styles.wordTokenContainer}>
              {isCurrentInput ? (
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.wordInput,
                    { borderBottomColor },
                  ]}
                  value={currentInput}
                  onChangeText={setCurrentInput}
                  onSubmitEditing={handleWordSubmit}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') handleBackspace();
                  }}
                  placeholder="..."
                  placeholderTextColor="#B2BEC3"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitted}
                  blurOnSubmit={false}
                />
              ) : (
                <View
                  style={[
                    styles.wordToken,
                    { backgroundColor: bgColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.wordTokenText,
                      { color: textColor },
                      status === 'error' && styles.wordTokenError,
                    ]}
                  >
                    {hasTyped && !submitted
                      ? typedWords[i]
                      : status === 'blank'
                      ? '___'
                      : correction || word}
                  </Text>
                  {status === 'error' && correction && (
                    <Text style={styles.wordCorrection}> {correction}</Text>
                  )}
                </View>
              )}

              {/* Space indicator */}
              {i < expectedWords.length - 1 && !isCurrentInput && (
                <Text style={styles.spaceChar}> </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // ── Complete screen ──
  if (allDone) {
    const totalCorrect = Array.from(sentenceResults.values())
      .flat()
      .filter((r) => r.status === 'correct').length;
    const totalWords = Array.from(sentenceResults.values()).flat().length;
    const overallAccuracy = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.topBar}>
          <StepIndicator currentStep={2} totalSteps={3} labels={STEP_LABELS} />
          <TouchableOpacity style={styles.closeButton} onPress={onExit} activeOpacity={0.7}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.completeContent}>
          <Text style={styles.completeEmoji}>✍️</Text>
          <Text style={styles.completeTitle}>听写完成！</Text>
          <Text style={styles.completeAccuracy}>
            听写正确率：{overallAccuracy}%
          </Text>
          <Text style={styles.completeDetail}>
            {totalCorrect}/{totalWords} 词正确
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleProceed}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>进入跟读 →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentSentence) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>素材数据错误</Text>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <StepIndicator currentStep={2} totalSteps={3} labels={STEP_LABELS} />
        <TouchableOpacity style={styles.closeButton} onPress={onExit} activeOpacity={0.7}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section header */}
          <Text style={styles.sectionHeader}>
            第 {sentenceIndex + 1}/{timeline.length} 句
          </Text>

          {/* Dictation card */}
          <View style={styles.dictationCard}>
            {/* Word grid */}
            {renderWordTokens()}

            {/* Progress within sentence */}
            <View style={styles.dictationMeta}>
              <Text style={styles.sentenceHint}>
                {submitted ? '比对结果' : '输入你听到的单词'}
              </Text>
              <Text style={styles.wordProgress}>
                <Text style={styles.countHighlight}>{typedWords.length}</Text>
                /{expectedWords.length} 词
              </Text>
            </View>
          </View>

          {/* Result hint */}
          {submitted && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                ✅ 绿色=正确  ❌ 红色=错误  ⚪ 灰色=没听出来
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {submitted ? (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReplay}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>🔁 再听一遍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNextSentence}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {sentenceIndex < timeline.length - 1
                    ? '下一句 →'
                    : '查看全部结果 →'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReplay}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>🔁 再听本句</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  typedWords.length === 0 && styles.primaryButtonDim,
                ]}
                onPress={handleSubmitSentence}
                disabled={typedWords.length === 0 || submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? '提交中...' : '提交 ✓'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingRight: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 12,
  },
  closeIcon: {
    fontSize: 16,
    color: '#636e72',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '500',
    color: '#636e72',
    textAlign: 'center',
  },
  dictationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 72,
    marginBottom: 8,
  },
  wordTokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  wordToken: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordTokenText: {
    fontSize: 15,
    fontWeight: '500',
  },
  wordTokenError: {
    textDecorationLine: 'line-through',
    textDecorationColor: '#FF6B6B',
  },
  wordCorrection: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  wordInput: {
    height: 36,
    minWidth: 60,
    paddingHorizontal: 8,
    borderBottomWidth: 2.5,
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3436',
    backgroundColor: 'transparent',
    
  },
  spaceChar: {
    width: 6,
  },
  dictationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F7FA',
    paddingTop: 8,
  },
  sentenceHint: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  wordProgress: {
    fontSize: 12,
    fontWeight: '500',
    color: '#636e72',
  },
  countHighlight: {
    color: '#2D3436',
    fontWeight: '600',
  },
  hintBox: {
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#636e72',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#636e72',
  },
  primaryButton: {
    flex: 2,
    height: 50,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDim: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Complete screen
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  completeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  completeAccuracy: {
    fontSize: 18,
    color: '#1E3A5F',
    fontWeight: '600',
    marginBottom: 4,
  },
  completeDetail: {
    fontSize: 14,
    color: '#636e72',
  },
  exitButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  exitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 16,
  },
});
