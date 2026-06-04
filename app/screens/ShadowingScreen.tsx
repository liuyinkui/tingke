/**
 * ShadowingScreen — 跟读页面
 *
 * 视觉参考: v2-minimal/shadowing.html
 * 功能: Step 3/3, 原文展示, 原音播放 + 录音回放, 评分展示
 * 使用 Web Speech API 播放原音
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../theme';
import { StepIndicator } from '../components/StepIndicator';
import { audioService } from '../services/speechService';

interface ShadowingScreenProps {
  navigation?: any;
  route?: any;
}

/** 使用 seed 中的真实英语句子 */
const SENTENCES = [
  'In modern society, communication plays a vital role in our daily lives.',
  'With the development of technology, people can now connect with each other more easily than ever before.',
  'However, many young people still find it difficult to express their thoughts clearly.',
  'This is especially true when they need to speak in public.',
  'The key to improving communication skills is practice and confidence building.',
  'Everyone can become a good communicator with enough effort.',
];

// 高亮词汇（原文中较难的生词）
const HIGHLIGHT_WORDS: Record<number, string[]> = {
  0: ['communication', 'vital'],
  1: ['development', 'technology'],
  2: ['difficult', 'express'],
  3: ['especially', 'public'],
  4: ['improving', 'confidence'],
  5: ['communicator'],
};

export const ShadowingScreen: React.FC<ShadowingScreenProps> = ({ navigation, route }) => {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'listen' | 'record' | 'result'>('listen');

  const currentSentence = SENTENCES[sentenceIndex] ?? '';
  const highlightWords = HIGHLIGHT_WORDS[sentenceIndex] ?? [];

  /** 播放原音 */
  const handlePlayOriginal = useCallback(async () => {
    await audioService.stop();
    setIsPlaying(true);
    setMode('listen');

    audioService.onEnd = () => {
      setIsPlaying(false);
      setMode('record');
    };

    await audioService.playSentence(sentenceIndex);
  }, [sentenceIndex]);

  /** 播放录音（模拟 — 低速播放原音模拟录音回放） */
  const handlePlayRecording = useCallback(async () => {
    await audioService.stop();
    setIsPlaying(true);
    await audioService.setSpeed(0.85);

    audioService.onEnd = () => {
      setIsPlaying(false);
      audioService.setSpeed(1.0);
    };

    await audioService.playSentence(sentenceIndex);
  }, [sentenceIndex]);

  /** 停止播放 */
  const handleStop = useCallback(async () => {
    await audioService.stop();
    setIsPlaying(false);
  }, []);

  /** 开始录音 */
  const handleRecordPress = useCallback(() => {
    if (!isRecording && mode === 'record') {
      setIsRecording(true);
      setMode('record');
    }
  }, [isRecording, mode]);

  /** 结束录音 → 模拟AI评分 */
  const handleRecordRelease = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setHasResult(true);
      setMode('result');
      // 模拟评分（基于句子难度）
      const baseScore = 70 + Math.floor(Math.random() * 20);
      setScore(Math.min(baseScore, 95));
    }
  }, [isRecording]);

  /** 下一句 */
  const handleNext = useCallback(() => {
    if (sentenceIndex < SENTENCES.length - 1) {
      setSentenceIndex((i) => i + 1);
      setHasResult(false);
      setScore(0);
      setMode('listen');
      setIsPlaying(false);
      setIsRecording(false);
      audioService.stop();
    } else {
      // 全部完成 → 跳转到完成页
      const accuracy = route?.params?.accuracy ?? 72;
      navigation?.navigate('Complete', {
        materialId: route?.params?.materialId ?? '1',
        accuracy,
        streak: 12,
      });
    }
  }, [sentenceIndex, navigation, route]);

  /** 渲染原文（含高亮词） */
  const renderText = () => {
    const parts = currentSentence.split(/(\s+)/);
    return parts.map((part, i) => {
      const isHighlight = highlightWords.some(
        (w) => part.toLowerCase().replace(/[^a-zA-Z'-]/g, '') === w.toLowerCase(),
      );
      return (
        <Text
          key={i}
          style={[
            styles.textNormal,
            isHighlight && styles.textHighlight,
          ]}
        >
          {part}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* 顶部栏 */}
        <View style={styles.top}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.ttl}>跟读</Text>
          <Text style={styles.stepText}>
            {sentenceIndex + 1} / {SENTENCES.length}
          </Text>
        </View>

        {/* 三步指示器 */}
        <StepIndicator currentStep={3} />

        {/* 原文展示 */}
        <View style={styles.textBox}>
          <Text style={styles.textBoxLabel}>
            跟读原文 · 第 {sentenceIndex + 1}/{SENTENCES.length} 句
          </Text>
          <View style={styles.textRow}>
            {renderText()}
          </View>
        </View>

        {/* 操作区域 */}
        <View style={styles.actionArea}>
          {/* 模式指示器 */}
          <View style={styles.stepIndicators}>
            <View style={[styles.stepDot, mode === 'listen' && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, mode === 'listen' && styles.stepDotTextActive]}>
                ① 听原音
              </Text>
            </View>
            <View style={styles.stepArrow}>→</View>
            <View style={[styles.stepDot, mode === 'record' && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, mode === 'record' && styles.stepDotTextActive]}>
                ② 跟读
              </Text>
            </View>
            <View style={styles.stepArrow}>→</View>
            <View style={[styles.stepDot, mode === 'result' && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, mode === 'result' && styles.stepDotTextActive]}>
                ③ 评分
              </Text>
            </View>
          </View>

          {/* 播放原音按钮 */}
          {mode === 'listen' && (
            <TouchableOpacity
              style={styles.playBtn}
              onPress={isPlaying ? handleStop : handlePlayOriginal}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>{isPlaying ? '⏹' : '▶'}</Text>
              <Text style={styles.playBtnText}>
                {isPlaying ? '停止播放' : '播放原音'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 录音按钮 */}
          {mode === 'record' && (
            <TouchableOpacity
              style={[
                styles.recordBtn,
                isRecording && styles.recordBtnActive,
              ]}
              onPressIn={handleRecordPress}
              onPressOut={handleRecordRelease}
              activeOpacity={0.8}
            >
              <Text style={styles.recordIcon}>
                {isRecording ? '🔴' : '🎤'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 状态提示 */}
          <View style={styles.statusArea}>
            <Text style={styles.statusText}>
              {mode === 'listen'
                ? isPlaying
                  ? '正在播放原音，请仔细听...'
                  : '点击播放原音，然后跟读'
                : mode === 'record'
                ? isRecording
                  ? '正在录音... 松手提交评分'
                  : '长按🎤按钮开始跟读录'
                : '录音完成，查看评分'}
            </Text>
          </View>

          {/* 评分 + 录音回放 */}
          {mode === 'result' && (
            <View style={styles.resultBox}>
              {/* 评分 */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>AI 评分</Text>
                <Text
                  style={[
                    styles.resultScore,
                    score >= 80
                      ? styles.scoreHigh
                      : score >= 70
                      ? styles.scoreMid
                      : styles.scoreLow,
                  ]}
                >
                  {score}
                </Text>
                <Text style={styles.resultUnit}>分</Text>
              </View>
              <View style={styles.progressBarSmall}>
                <View
                  style={[
                    styles.progressFillSmall,
                    {
                      width: `${score}%`,
                      backgroundColor:
                        score >= 80
                          ? colors.success
                          : score >= 70
                          ? colors.brand
                          : colors.warning,
                    },
                  ]}
                />
              </View>

              {/* 录音回放 */}
              <TouchableOpacity
                style={styles.replayBtn}
                onPress={isPlaying ? handleStop : handlePlayRecording}
                activeOpacity={0.8}
              >
                <Text style={styles.replayBtnIcon}>
                  {isPlaying ? '⏹' : '🔊'}
                </Text>
                <Text style={styles.replayBtnText}>
                  {isPlaying ? '停止回放' : '回放我的录音'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 底部按钮 */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.nextBtn, mode !== 'result' && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={mode !== 'result'}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextText, mode !== 'result' && styles.nextTextDisabled]}>
              {sentenceIndex < SENTENCES.length - 1 ? '下一句 →' : '查看结果 →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  // —— 顶部栏 ——
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.base,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: fontSize.titleM,
    color: colors.textPrimary,
  },
  ttl: {
    fontSize: fontSize.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  stepText: {
    fontSize: fontSize.bodyS,
    color: colors.textTertiary,
  },
  // —— 原文展示 ——
  textBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: fontSize.titleL,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: fontSize.titleL,
    flexShrink: 0,
    ...shadows.sm,
  },
  textBoxLabel: {
    fontSize: fontSize.captionM,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textNormal: {
    fontSize: fontSize.bodyS,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  textHighlight: {
    color: colors.brand,
    fontWeight: '500',
    borderBottomWidth: 2,
    borderBottomColor: colors.brandLight,
  },
  // —— 操作区域 ——
  actionArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  // —— 步骤指示器 ——
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepDot: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutral2,
  },
  stepDotActive: {
    backgroundColor: colors.brandLight,
  },
  stepDotText: {
    fontSize: fontSize.captionM,
    color: colors.textTertiary,
  },
  stepDotTextActive: {
    color: colors.brand,
    fontWeight: '500',
  },
  stepArrow: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
  },
  // —— 播放原音 ——
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['3xl'],
    backgroundColor: colors.brand,
    borderRadius: radius.full,
    ...shadows.sm,
  },
  playIcon: {
    fontSize: 16,
    color: '#fff',
  },
  playBtnText: {
    fontSize: fontSize.bodyS,
    color: '#fff',
    fontWeight: '600',
  },
  // —— 录音按钮 ——
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brand,
    ...shadows.sm,
    shadowColor: colors.brand,
    shadowOpacity: 0.12,
  },
  recordBtnActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  recordIcon: {
    fontSize: 26,
  },
  // —— 状态提示 ——
  statusArea: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // —— 评分结果 ——
  resultBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    width: '100%',
    ...shadows.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  resultLabel: {
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  resultScore: {
    fontSize: fontSize.displayS,
    fontWeight: '700',
  },
  scoreHigh: {
    color: colors.success,
  },
  scoreMid: {
    color: colors.brand,
  },
  scoreLow: {
    color: colors.warning,
  },
  resultUnit: {
    fontSize: fontSize.bodyS,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  progressBarSmall: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: radius.full,
  },
  // —— 录音回放按钮 ——
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.brandLight,
    borderRadius: radius.full,
  },
  replayBtnIcon: {
    fontSize: 14,
    color: colors.brand,
  },
  replayBtnText: {
    fontSize: fontSize.bodyS,
    color: colors.brand,
    fontWeight: '500',
  },
  // —— 底部 ——
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexShrink: 0,
  },
  nextBtn: {
    height: 40,
    paddingHorizontal: spacing['3xl'],
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: colors.neutral6,
  },
  nextText: {
    fontSize: fontSize.bodyS,
    fontWeight: '600',
    color: '#fff',
  },
  nextTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
});
