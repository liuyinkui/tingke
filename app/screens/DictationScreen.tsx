/**
 * DictationScreen — 听写页面
 *
 * 视觉参考: v2-minimal/dictation.html
 * 功能: Step 2/3, 逐句听写, 即时判对错, 显示正确答案
 * 使用 Web Speech API 播放当前句子音频
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../theme';
import { StepIndicator } from '../components/StepIndicator';
import { DictationInput } from '../components/DictationInput';
import { speechService } from '../services/speechService';
import { DictationResult } from '../types';

interface DictationScreenProps {
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

export const DictationScreen: React.FC<DictationScreenProps> = ({ navigation, route }) => {
  const [results, setResults] = useState<DictationResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentSentenceRef = useRef(0);

  const handleSubmitSentence = useCallback(
    (index: number, result: DictationResult) => {
      setResults((prev) => {
        const next = [...prev];
        next[index] = result;
        return next;
      });
    },
    [],
  );

  /** 播放当前句子 */
  const handlePlaySentence = useCallback(
    async (index: number) => {
      currentSentenceRef.current = index;
      const text = SENTENCES[index];
      if (!text) return;

      speechService.stop();
      setIsPlaying(true);

      speechService.onEnd = () => {
        setIsPlaying(false);
      };

      await speechService.playText(text);
    },
    [],
  );

  /** 重听当前句子 */
  const handleReplay = useCallback(() => {
    const idx = results.length;
    if (idx < SENTENCES.length) {
      handlePlaySentence(idx);
    }
  }, [results.length, handlePlaySentence]);

  /** 计算当前正确数 */
  const correctCount = results.filter((r) => r?.status === 'correct').length;

  const handleNext = () => {
    navigation?.navigate('Shadowing', { materialId: route?.params?.materialId ?? '1' });
  };

  const handleComplete = () => {
    const accuracy = Math.round((correctCount / SENTENCES.length) * 100);
    navigation?.navigate('Complete', {
      materialId: route?.params?.materialId ?? '1',
      accuracy,
      streak: 12,
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
          <Text style={styles.ttl}>听写</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={handleComplete}>
            <Text style={styles.doneText}>完成</Text>
          </TouchableOpacity>
        </View>

        {/* 三步指示器 */}
        <StepIndicator currentStep={2} />

        {/* 音频播放控制 */}
        <View style={styles.audioControl}>
          <Text style={styles.audioLabel}>
            当前句子 · 第 {Math.min(results.length + 1, SENTENCES.length)}/{SENTENCES.length}
          </Text>
          <View style={styles.audioRow}>
            <TouchableOpacity
              style={styles.replayBtn}
              onPress={handleReplay}
              activeOpacity={0.8}
            >
              <Text style={styles.replayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              <Text style={styles.replayText}>
                {isPlaying ? '播放中...' : '重听当前句'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 当前播放句子预览 */}
          <View style={styles.sentencePreview}>
            <Text style={styles.previewText} numberOfLines={2}>
              "{SENTENCES[Math.min(results.length, SENTENCES.length - 1)]}"
            </Text>
          </View>
        </View>

        {/* 听写输入区域 */}
        <ScrollView style={styles.dictScroll} contentContainerStyle={styles.dictContent}>
          <DictationInput sentences={SENTENCES} onSubmitSentence={handleSubmitSentence} />
        </ScrollView>

        {/* 底部状态栏 */}
        <View style={styles.bottom}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNum}>{correctCount}</Text>
            <Text style={styles.scoreDivider}>/ {SENTENCES.length}</Text>
            <Text style={styles.scoreLabel}> 正确</Text>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextText}>下一句 →</Text>
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
    paddingBottom: spacing.lg,
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
  doneBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  doneText: {
    fontSize: fontSize.bodyS,
    color: colors.brand,
    fontWeight: '500',
  },
  // —— 音频控制 ——
  audioControl: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.base,
    flexShrink: 0,
    ...shadows.sm,
  },
  audioLabel: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.brandLight,
    borderRadius: radius.full,
  },
  replayIcon: {
    fontSize: 14,
    color: colors.brand,
  },
  replayText: {
    fontSize: fontSize.bodyS,
    color: colors.brand,
    fontWeight: '500',
  },
  sentencePreview: {
    marginTop: spacing.sm,
    backgroundColor: colors.neutral2,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  previewText: {
    fontSize: fontSize.captionL,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // —— 听写区域 ——
  dictScroll: {
    flex: 1,
    marginTop: spacing.sm,
    paddingRight: spacing.sm,
  },
  dictContent: {
    paddingBottom: spacing.md,
  },
  // —— 底部 ——
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexShrink: 0,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNum: {
    fontSize: fontSize.titleM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scoreDivider: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
  },
  scoreLabel: {
    fontSize: fontSize.captionL,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  nextBtn: {
    height: 38,
    paddingHorizontal: fontSize.titleL,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: fontSize.bodyS,
    fontWeight: '600',
    color: '#fff',
  },
});
