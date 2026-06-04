/**
 * HomeScreen — 首页
 *
 * 视觉参考: v2-minimal/homepage.html
 * 显示 streak、今日素材卡片、周准确率、开始练习按钮
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../theme';
import { Material } from '../types';

interface HomeScreenProps {
  navigation?: any;
}

const MOCK_MATERIAL: Material = {
  id: '1',
  title: '人类世的终结',
  titleEn: 'The End of the Anthropocene',
  difficulty: 'intermediate',
  duration: 900,
  sentences: [],
  audioUrl: '',
  source: 'CET-6',
  tags: ['环境', '科学'],
};

// 占位数据
const MOCK_STREAK = 12;
const MOCK_WEEKLY_ACCURACY = 78;
const MOCK_ACCURACY_TREND = 5;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleStartPractice = () => {
    navigation?.navigate('Listen', { materialId: MOCK_MATERIAL.id });
  };

  const handleNavigateLibrary = () => {
    navigation?.navigate('Library');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 顶部品牌 + 头像 */}
        <View style={styles.head}>
          <Text style={styles.brand}>
            听<Text style={styles.brandAccent}>刻</Text>
          </Text>
          <TouchableOpacity style={styles.avatar} activeOpacity={0.7}>
            <Text style={styles.avatarIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* 日期 + streak */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>2026.06.04 · 星期四</Text>
          <View style={styles.streakBadge}>
            <Text>🔥 </Text>
            <Text style={styles.streakNum}>{MOCK_STREAK}</Text>
            <Text style={styles.streakLabel}> 天连续</Text>
          </View>
        </View>

        {/* 今日练习素材卡片 */}
        <View style={[styles.todayCard]}>
          <Text style={styles.cardLabel}>今日练习</Text>
          <Text style={styles.cardTitle}>{MOCK_MATERIAL.title}</Text>
          <Text style={styles.cardEn}>{MOCK_MATERIAL.titleEn}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>🎧 盲听</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>✍️ 听写</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>🗣️ 跟读</Text>
              </View>
            </View>
            <Text style={styles.cardTime}>中高级 · 15min</Text>
          </View>
        </View>

        {/* 周准确率卡片 */}
        <View style={styles.accuracyCard}>
          <View style={styles.accuracyIcon}>
            <Text style={styles.accuracyEmoji}>📊</Text>
          </View>
          <View style={styles.accuracyInfo}>
            <Text style={styles.accuracyTitle}>本周准确率</Text>
            <Text style={styles.accuracyHint}>比上周提升 {MOCK_ACCURACY_TREND}%</Text>
          </View>
          <Text style={styles.accuracyValue}>{MOCK_WEEKLY_ACCURACY}%</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* 开始练习按钮 */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartPractice}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>开始今日练习 →</Text>
        </TouchableOpacity>

        {/* 底部引导文字 */}
        <Text style={styles.footerText}>每天 15 分钟，三步练听力</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['5xl'],
    flexGrow: 1,
  },
  // —— 顶部 ——
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingTop: spacing.base,
  },
  brand: {
    fontSize: fontSize.titleL,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  brandAccent: {
    color: colors.brand,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 16,
  },
  // —— 日期/streak ——
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dateText: {
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNum: {
    fontWeight: '700',
    color: colors.brand,
    fontSize: fontSize.subtitleS,
  },
  streakLabel: {
    fontSize: fontSize.captionL,
    color: colors.textPrimary,
  },
  // —— 今日卡片 ——
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    marginBottom: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    ...shadows.sm,
  },
  cardLabel: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.titleM,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  cardEn: {
    fontSize: fontSize.bodyS,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.brandLight,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: fontSize.captionL,
    fontWeight: '500',
    color: colors.brand,
  },
  cardTime: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
  },
  // —— 准确率卡片 ——
  accuracyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    ...shadows.sm,
  },
  accuracyIcon: {},
  accuracyEmoji: {
    fontSize: fontSize.titleL,
  },
  accuracyInfo: {
    flex: 1,
  },
  accuracyTitle: {
    fontSize: fontSize.bodyS,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accuracyHint: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  accuracyValue: {
    fontSize: fontSize.titleM,
    fontWeight: '700',
    color: colors.brand,
  },
  spacer: {
    flex: 1,
    minHeight: spacing['3xl'],
  },
  // —— CTA ——
  ctaButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    shadowColor: colors.brand,
    shadowOpacity: 0.2,
  },
  ctaText: {
    fontSize: fontSize.bodyM,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: 'center',
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    marginTop: spacing.lg,
  },
});
