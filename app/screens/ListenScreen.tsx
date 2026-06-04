/**
 * ListenScreen — 盲听页面
 *
 * 视觉参考: v2-minimal/listen.html
 * 功能: Step 1/3, 音频播放器, 原文脚本显示, 变速控制
 */

import React from 'react';
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
import { AudioPlayer } from '../components/AudioPlayer';

interface ListenScreenProps {
  navigation?: any;
  route?: any;
}

const MOCK_SENTENCES = [
  'The anthropocene is a proposed geological epoch dating from the commencement of significant human impact on Earth\'s geology and ecosystems.',
  'This term was popularized by Nobel Prize-winning atmospheric chemist Paul Crutzen in the early 2000s.',
  'The concept challenges the traditional Holocene epoch classification.',
  'Scientists continue to debate the exact starting point of this new epoch.',
];

export const ListenScreen: React.FC<ListenScreenProps> = ({ navigation, route }) => {
  const handleSkip = () => {
    navigation?.navigate('Dictation', { materialId: route?.params?.materialId ?? '1' });
  };

  const handleNext = () => {
    navigation?.navigate('Dictation', { materialId: route?.params?.materialId ?? '1' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* 顶部栏 */}
        <View style={styles.top}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.ttl}>盲听</Text>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>跳过</Text>
          </TouchableOpacity>
        </View>

        {/* 三步指示器 */}
        <StepIndicator currentStep={1} />

        {/* 音频播放器 */}
        <AudioPlayer
          segmentIndex={1}
          totalSegments={4}
          progress={35}
          currentTime="0:23"
          totalTime="1:30"
        />

        {/* 原文脚本 */}
        <ScrollView style={styles.script} contentContainerStyle={styles.scriptContent}>
          {MOCK_SENTENCES.map((sentence, i) => (
            <View
              key={i}
              style={[styles.scriptParagraph, i === 0 && styles.scriptParagraphCurrent]}
            >
              <Text style={styles.scriptIndex}>
                {i === 0 ? '当前段' : i === 1 ? '下一段' : `第${i + 1}段`}
              </Text>
              <Text style={[styles.scriptText, i === 0 && styles.scriptTextCurrent]}>
                {sentence}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 底部操作栏 */}
        <View style={styles.bottom}>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeIcon}>⏱</Text>
            <Text style={styles.timeText}> 0:23 / 1:30</Text>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextText}>进入听写 →</Text>
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
  skipBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: fontSize.bodyS,
    color: colors.textTertiary,
  },
  // —— 原文脚本 ——
  script: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  scriptContent: {
    paddingBottom: spacing.base,
  },
  scriptParagraph: {
    padding: spacing.base,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scriptParagraphCurrent: {
    borderColor: colors.divider,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  scriptIndex: {
    fontSize: fontSize.captionM,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  scriptText: {
    fontSize: fontSize.bodyS,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  scriptTextCurrent: {
    color: colors.textPrimary,
  },
  // —— 底部 ——
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: spacing.md,
    flexShrink: 0,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 14,
  },
  timeText: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
  },
  nextBtn: {
    height: 40,
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
