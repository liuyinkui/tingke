import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import StepIndicator from '../components/StepIndicator';
import AudioPlayer from '../components/AudioPlayer';
import { MaterialDetail } from '../services/materials';
import { submitRecording, WordDetail } from '../services/recording';

interface Props {
  material: MaterialDetail;
  onComplete: () => void;
  onExit: () => void;
}

interface WordScore {
  word: string;
  score: number;
  phonemes: Array<{
    phoneme: string;
    score: number;
    suggestions: string[];
  }>;
}

const STEP_LABELS = ['盲听', '听写', '跟读'];

export default function FollowAlongScreen({ material, onComplete, onExit }: Props) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<{
    overallScore: number;
    wordScores: WordScore[];
    recordingId: string;
  } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [allDone, setAllDone] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const userSoundRef = useRef<Audio.Sound | null>(null);

  const timeline = material.sentence_timeline || [];
  const currentSentenceText = timeline[currentSentence]?.text || '';

  // ── Recording ─────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要麦克风权限才能录音');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      Alert.alert('录音失败', '无法启动录音');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      setScoring(true);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        Alert.alert('录音失败', '无法获取录音文件');
        setScoring(false);
        return;
      }

      // Submit for evaluation
      const evalResult = await submitRecording(uri, material.id, currentSentence);

      // Build word scores
      const wordScores: WordScore[] = evalResult.details.map((d: WordDetail) => ({
        word: d.word,
        score: d.score,
        phonemes: d.phonemes.map((p) => ({
          phoneme: p.phoneme,
          score: p.score,
          suggestions: p.suggestions || [],
        })),
      }));

      setResult({
        overallScore: evalResult.score,
        wordScores,
        recordingId: evalResult.id,
      });
      setRecorded(true);
      setScoring(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || '评分失败';
      Alert.alert('评分失败', msg);
      setScoring(false);
    }
  }, [material.id, currentSentence]);

  const handlePressIn = useCallback(() => {
    startRecording();
  }, [startRecording]);

  const handlePressOut = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // ── Playback ──────────────────────────────────────────

  const playOriginal = useCallback(async () => {
    setShowOriginal(true);
    // Will be handled by AudioPlayer via sentence timeline
  }, []);

  const playUserRecording = useCallback(async () => {
    setShowOriginal(false);
    if (result?.recordingId) {
      try {
        if (userSoundRef.current) {
          await userSoundRef.current.unloadAsync();
        }
        // We'll use the compare endpoint audio_url
        const { getCompare } = await import('../services/recording');
        const compare = await getCompare(result.recordingId);
        const { sound } = await Audio.Sound.createAsync(
          { uri: compare.user_audio_url },
          { shouldPlay: true }
        );
        userSoundRef.current = sound;
      } catch {
        // Silent fail
      }
    }
  }, [result]);

  // ── All sentences complete ────────────────────────────

  const handleNextSentence = useCallback(() => {
    if (currentSentence < timeline.length - 1) {
      setCurrentSentence((i) => i + 1);
      setRecorded(false);
      setResult(null);
      setShowOriginal(true);
    } else {
      setAllDone(true);
    }
  }, [currentSentence, timeline.length]);

  const handleProceed = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Render helpers ────────────────────────────────────

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00B894';
    if (score >= 60) return '#0984e3';
    if (score >= 40) return '#e17055';
    return '#d63031';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '💪';
    return '🔊';
  };

  // ── Complete screen ──
  if (allDone) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.topBar}>
          <StepIndicator currentStep={3} totalSteps={3} labels={STEP_LABELS} />
          <TouchableOpacity style={styles.closeButton} onPress={onExit} activeOpacity={0.7}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.completeContent}>
          <Text style={styles.completeEmoji}>🎤</Text>
          <Text style={styles.completeTitle}>跟读完成！</Text>
          <Text style={styles.completeSubtext}>学习流全部完成，准备查看学习报告</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleProceed}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>查看学习报告 →</Text>
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
        <StepIndicator currentStep={3} totalSteps={3} labels={STEP_LABELS} />
        <TouchableOpacity style={styles.closeButton} onPress={onExit} activeOpacity={0.7}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Section header */}
        <Text style={styles.sectionHeader}>
          第 {currentSentence + 1}/{timeline.length} 句 · 跟读
        </Text>

        {/* Current sentence */}
        <View style={styles.sentenceCard}>
          <Text style={styles.sentenceText}>{currentSentenceText}</Text>
        </View>

        {/* Score display (after recording) */}
        {result && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>发音评分</Text>
            <View style={styles.scoreMain}>
              <Text style={[styles.scoreNumber, { color: getScoreColor(result.overallScore) }]}>
                {result.overallScore}
              </Text>
              <Text style={styles.scoreSuffix}>分</Text>
              <Text style={styles.scoreEmoji}>{getScoreEmoji(result.overallScore)}</Text>
            </View>

            {/* Per-word breakdown */}
            {result.wordScores.length > 1 && (
              <View style={styles.wordScoresContainer}>
                {result.wordScores.map((ws, i) => (
                  <View key={i} style={styles.wordScoreRow}>
                    <Text style={styles.wordScoreWord}>{ws.word}</Text>
                    <View style={styles.wordScoreBar}>
                      <View
                        style={[
                          styles.wordScoreFill,
                          {
                            width: `${ws.score}%`,
                            backgroundColor: getScoreColor(ws.score),
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.wordScoreNum, { color: getScoreColor(ws.score) }]}
                    >
                      {ws.score}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Phoneme feedback */}
            {result.wordScores.some((ws) => ws.phonemes.some((p) => p.score < 70)) && (
              <View style={styles.phonemeSection}>
                <Text style={styles.phonemeTitle}>需要改进的发音</Text>
                {result.wordScores.map((ws) =>
                  ws.phonemes
                    .filter((p) => p.score < 70)
                    .map((p, pi) => (
                      <View key={`${ws.word}-${pi}`} style={styles.phonemeRow}>
                        <Text style={styles.phonemeChar}>/ {p.phoneme} /</Text>
                        <Text style={styles.phonemeScore}>{p.score}分</Text>
                        {p.suggestions.length > 0 && (
                          <Text style={styles.phonemeSuggestion}>
                            {p.suggestions[0]}
                          </Text>
                        )}
                      </View>
                    ))
                )}
              </View>
            )}
          </View>
        )}

        {/* Audio comparison controls */}
        {recorded && (
          <View style={styles.compareRow}>
            <TouchableOpacity
              style={[styles.compareButton, showOriginal && styles.compareButtonActive]}
              onPress={playOriginal}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.compareButtonText,
                  showOriginal && styles.compareButtonTextActive,
                ]}
              >
                🎧 原声
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.compareButton, !showOriginal && styles.compareButtonActive]}
              onPress={playUserRecording}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.compareButtonText,
                  !showOriginal && styles.compareButtonTextActive,
                ]}
              >
                🎤 我的
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {scoring && (
          <View style={styles.scoringHint}>
            <Text style={styles.scoringHintText}>AI 评分中...</Text>
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {recorded ? (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setRecorded(false);
                setResult(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>🔁 重录</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNextSentence}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {currentSentence < timeline.length - 1 ? '下一句 →' : '完成 →'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Audio player for reference */}
            <View style={{ flex: 1 }}>
              <AudioPlayer
                audioUrl={material.audio_url}
                sentenceTimeline={timeline}
                currentSentenceIndex={currentSentence}
                onSentenceChange={setCurrentSentence}
              />
            </View>

            {/* Record button */}
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
                scoring && styles.recordButtonDisabled,
              ]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={scoring}
              activeOpacity={0.8}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? '🔴 录音中...' : scoring ? '⏳' : '🎤 按住录音'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '500',
    color: '#636e72',
    textAlign: 'center',
  },
  sentenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sentenceText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#2D3436',
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B2BEC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 4,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scoreSuffix: {
    fontSize: 20,
    color: '#636e72',
    fontWeight: '500',
  },
  scoreEmoji: {
    fontSize: 28,
    marginLeft: 8,
  },
  wordScoresContainer: {
    gap: 8,
  },
  wordScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordScoreWord: {
    width: 60,
    fontSize: 13,
    fontWeight: '500',
    color: '#2D3436',
  },
  wordScoreBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  wordScoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  wordScoreNum: {
    width: 30,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  phonemeSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  phonemeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e17055',
    marginBottom: 8,
  },
  phonemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 10,
  },
  phonemeChar: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d63031',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  phonemeScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e17055',
  },
  phonemeSuggestion: {
    fontSize: 12,
    color: '#636e72',
    flex: 1,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compareButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareButtonActive: {
    borderColor: '#1E3A5F',
    backgroundColor: '#EBF0F7',
  },
  compareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636e72',
  },
  compareButtonTextActive: {
    color: '#1E3A5F',
    fontWeight: '600',
  },
  scoringHint: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  scoringHintText: {
    fontSize: 13,
    color: '#636e72',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  secondaryButton: {
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
    height: 50,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordButton: {
    height: 56,
    backgroundColor: '#1E3A5F',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  recordButtonActive: {
    backgroundColor: '#e17055',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonText: {
    fontSize: 16,
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
  completeSubtext: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
});
