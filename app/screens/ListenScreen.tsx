/**
 * ListenScreen — 盲听页面
 *
 * 视觉参考: v2-minimal/listen.html
 * 功能: Step 1/3, Web Speech TTS 语音朗读, 原文脚本展示, 变速控制
 */

import React, { useCallback, useState } from 'react';
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

/** 使用 seed 中的真实英语句子 */
const SENTENCES = [
  'In modern society, communication plays a vital role in our daily lives.',
  'With the development of technology, people can now connect with each other more easily than ever before.',
  'However, many young people still find it difficult to express their thoughts clearly.',
  'This is especially true when they need to speak in public.',
  'The key to improving communication skills is practice and confidence building.',
  'Everyone can become a good communicator with enough effort.',
];

export const ListenScreen: React.FC<ListenScreenProps> = ({ navigation, route }) => {
  const [sentenceIndex, setSentenceIndex] = useState(0);

  const handleSkip = useCallback(() => {
    navigation?.navigate('Dictation', { materialId: route?.params?.materialId ?? '1' });
  }, [navigation, route]);

  const handleNext = useCallback(() => {
    navigation?.navigate('Dictation', { materialId: route?.params?.materialId ?? '1' });
  }, [navigation, route]);

  const handleIndexChange = useCallback((index: number) => {
    setSentenceIndex(index);
  }, []);

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

        {/* 语音合成播放器 — Web Speech TTS */}
        <AudioPlayer
          sentences={SENTENCES}
          currentIndex={sentenceIndex}
          onIndexChange={handleIndexChange}
          autoPlay={true}
        />

        {/* 原文脚本 */}
        <ScrollView style={styles.script} contentContainerStyle={styles.scriptContent}>
          {SENTENCES.map((sentence, i) => (
            <View
              key={i}
              style={[
                styles.scriptParagraph,
                i === sentenceIndex && styles.scriptParagraphCurrent,
              ]}
            >
              <Text style={styles.scriptIndex}>
                {i === sentenceIndex ? '当前句' : `第 ${i + 1} 句`}
              </Text>
              <Text
                style={[
                  styles.scriptText,
                  i === sentenceIndex && styles.scriptTextCurrent,
                ]}
              >
                {sentence}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 底部操作栏 */}
        <View style={styles.bottom}>
          <View style={styles.sentenceCount}>
            <Text style={styles.countText}>
              {sentenceIndex + 1} / {SENTENCES.length} 句
            </Text>
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
    backgroundColor: colors.brandLight,
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
  sentenceCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
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
