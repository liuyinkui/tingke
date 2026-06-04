/**
 * ShadowingScreen — 跟读页面
 *
 * 视觉参考: v2-minimal/shadowing.html
 * 功能: Step 3/3, 原文展示, 长按录音, 评分展示
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../theme';
import { StepIndicator } from '../components/StepIndicator';

interface ShadowingScreenProps {
  navigation?: any;
  route?: any;
}

const MOCK_CURRENT_SENTENCE =
  'The anthropocene is a proposed geological epoch dating from the commencement of significant human impact on Earth\'s geology and ecosystems.';

// 高亮词汇（原文中加粗的生词）
const HIGHLIGHT_WORDS = ['anthropocene', 'commencement', 'significant'];

export const ShadowingScreen: React.FC<ShadowingScreenProps> = ({ navigation, route }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleRecordPress = useCallback(() => {
    if (!isRecording) {
      // 开始录音
      setIsRecording(true);
    }
  }, [isRecording]);

  const handleRecordRelease = useCallback(() => {
    if (isRecording) {
      // 结束录音 → 模拟AI评分
      setIsRecording(false);
      setHasResult(true);
      setScore(Math.floor(Math.random() * 30) + 65); // 65-95
    }
  }, [isRecording]);

  const handleNext = () => {
    if (hasResult) {
      // 完成跟读 → 跳转到完成页
      const accuracy = route?.params?.accuracy ?? 72;
      navigation?.navigate('Complete', {
        materialId: route?.params?.materialId ?? '1',
        accuracy,
        streak: 12,
      });
    }
  };

  /** 渲染原文（含高亮词） */
  const renderText = () => {
    const parts = MOCK_CURRENT_SENTENCE.split(/(\s+)/);
    return parts.map((part, i) => {
      const isHighlight = HIGHLIGHT_WORDS.some(
        (w) => part.toLowerCase().includes(w) && part.length === w.length,
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
          <View style={styles.backBtn} />
        </View>

        {/* 三步指示器 */}
        <StepIndicator currentStep={3} />

        {/* 原文展示 */}
        <View style={styles.textBox}>
          <Text style={styles.textBoxLabel}>跟读原文 · 第 1/4 句</Text>
          <View style={styles.textRow}>
            {renderText()}
          </View>
        </View>

        {/* 录音区域 */}
        <View style={styles.recordingArea}>
          {/* 录音按钮 */}
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

          <View style={styles.recordingHint}>
            <Text style={styles.hintText}>
              {isRecording ? '正在录音...' : hasResult ? '录音完成' : '轻触开始录音'}
            </Text>
            <Text style={styles.hintSub}>
              {isRecording
                ? '松手提交评分'
                : hasResult
                ? ''
                : '照着上面的句子跟读'}
            </Text>
          </View>

          {/* 评分结果 */}
          {hasResult && (
            <View style={styles.resultBox}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>AI 评分</Text>
                <Text
                  style={[
                    styles.resultScore,
                    score >= 80 ? styles.scoreHigh : score >= 70 ? styles.scoreMid : styles.scoreLow,
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
                        score >= 80 ? colors.success : score >= 70 ? colors.brand : colors.warning,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* 底部按钮 */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.nextBtn, !hasResult && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!hasResult}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextText, !hasResult && styles.nextTextDisabled]}>
              {hasResult ? '查看结果 →' : '下一句 →'}
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
  // —— 原文展示 ——
  textBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: fontSize.titleL,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: fontSize.titleL,
    flexShrink: 0,
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
  // —— 录音区域 ——
  recordingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
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
  recordingHint: {
    alignItems: 'center',
  },
  hintText: {
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
  },
  hintSub: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  // —— 评分结果 ——
  resultBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    width: '100%',
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
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: radius.full,
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
