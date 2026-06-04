/**
 * CompleteScreen — 完成页
 *
 * 视觉参考: v2-minimal/complete.html
 * 功能: 学习完成后的报告页, 准确率/盲区词汇/连续打卡
 *       最重要的留存页 — 用户在这决定明天还来不来
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../theme';

interface CompleteScreenProps {
  navigation?: any;
  route?: any;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({ navigation, route }) => {
  const accuracy = route?.params?.accuracy ?? 72;
  const streak = route?.params?.streak ?? 12;
  const blindSpotCount = 3;
  const totalMinutes = 15;
  const completedSentences = 4;

  // 🎉 完成动画
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleShare = () => {
    // 分享打卡（MVP暂不实现）
  };

  const handleContinueTomorrow = () => {
    navigation?.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 🎉 庆祝头部 */}
        <Animated.View
          style={[
            styles.celebration,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>太棒了！</Text>
          <Text style={styles.celebrationSub}>今天的练习全部完成</Text>
        </Animated.View>

        {/* 数据卡片网格 */}
        <View style={styles.cardsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.statValueGreen]}>{accuracy}%</Text>
            <Text style={styles.statLabel}>辨音准确率</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.statValueBrand]}>{blindSpotCount}</Text>
            <Text style={styles.statLabel}>盲区词汇</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>学习分钟</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedSentences}</Text>
            <Text style={styles.statLabel}>完成句子</Text>
          </View>
        </View>

        {/* Streak 进度条 */}
        <View style={styles.streakSection}>
          <View style={styles.streakIcon}>
            <Text style={styles.streakEmoji}>🔥</Text>
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{streak} 天连续打卡</Text>
            <Text style={styles.streakHint}>又坚持了一天，棒！</Text>
          </View>
          <View style={styles.streakBadgeNew}>
            <Text style={styles.streakBadgeText}>+1</Text>
          </View>
        </View>

        {/* 盲区词汇卡 */}
        <View style={styles.blindSpotCard}>
          <View style={styles.blindSpotIcon}>
            <Text style={styles.blindSpotEmoji}>📝</Text>
          </View>
          <View style={styles.blindSpotContent}>
            <Text style={styles.blindSpotTitle}>{blindSpotCount} 个待复习词汇</Text>
            <Text style={styles.blindSpotWords}>anthropocene · commencement · geological</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* 操作按钮 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>分享今日打卡</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleContinueTomorrow}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>明天继续 →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['3xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
    flexGrow: 1,
  },
  // —— 庆祝头部 ——
  celebration: {
    alignItems: 'center',
    marginTop: spacing['5xl'],
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.base,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  celebrationSub: {
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  // —— 数据卡片 ——
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    width: '100%',
    marginTop: spacing['3xl'],
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.displayM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statValueGreen: {
    color: colors.success,
  },
  statValueBrand: {
    color: colors.brand,
  },
  statLabel: {
    fontSize: fontSize.captionL,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  // —— Streak ——
  streakSection: {
    backgroundColor: colors.brand,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    width: '100%',
    marginTop: spacing.base,
  },
  streakIcon: {},
  streakEmoji: {
    fontSize: fontSize.displayS,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: fontSize.titleM,
    fontWeight: '700',
    color: '#fff',
  },
  streakHint: {
    fontSize: fontSize.captionL,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.sm,
  },
  streakBadgeNew: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
  },
  streakBadgeText: {
    fontSize: fontSize.captionL,
    color: '#fff',
  },
  // —— 盲区词汇 ——
  blindSpotCard: {
    backgroundColor: colors.brandLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(2,180,127,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    width: '100%',
    marginTop: spacing.base,
  },
  blindSpotIcon: {},
  blindSpotEmoji: {
    fontSize: fontSize.titleM,
  },
  blindSpotContent: {
    flex: 1,
  },
  blindSpotTitle: {
    fontSize: fontSize.bodyM,
    fontWeight: '600',
    color: colors.brand,
  },
  blindSpotWords: {
    fontSize: fontSize.bodyS,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  // —— Spacer ——
  spacer: {
    flex: 1,
    minHeight: spacing['2xl'],
  },
  // —— 按钮 ——
  actions: {
    width: '100%',
    gap: spacing.base,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    shadowColor: colors.brand,
    shadowOpacity: 0.2,
  },
  primaryBtnText: {
    fontSize: fontSize.bodyM,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSize.bodyM,
    color: colors.textSecondary,
  },
});
