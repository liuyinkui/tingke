// 听刻 · 首页
// 参考：design/v4/homepage.html + design-spec.html §③

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, radius, shadows } from '../theme';

// TODO: 从 API 读取数据
const MOCK_DATA = {
  streak: 7,
  todayDuration: '3分12秒',
  hasCompletedToday: false,
};

export const HomeScreen: React.FC = () => {
  const { streak, todayDuration, hasCompletedToday } = MOCK_DATA;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.container}>
        {/* Streak 徽章 */}
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>
            🔥 连续打卡 {streak} 天
          </Text>
        </View>

        {/* 今日练习信息 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>今日练习</Text>
          <Text style={styles.infoValue}>
            {hasCompletedToday ? '已练完 ✅' : todayDuration}
          </Text>
          {!hasCompletedToday && (
            <Text style={styles.infoHint}>每天15分钟，精听→听写→跟读</Text>
          )}
        </View>

        {/* 主按钮 */}
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>
            {hasCompletedToday ? '查看今日详情' : '开始今日练习'}
          </Text>
        </TouchableOpacity>

        {/* 底部导航 */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navText}>📚 素材库</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navLink}>
            <Text style={styles.navText}>👤 个人中心</Text>
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
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    backgroundColor: '#FFF5F0',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing['2xl'],
  },
  streakText: {
    fontSize: fontSize.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  infoLabel: {
    fontSize: fontSize.caption,
    color: colors.textHint,
    marginBottom: spacing.sm,
  },
  infoValue: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoHint: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  primaryBtn: {
    height: 52,
    paddingHorizontal: spacing['2xl'],
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  primaryBtnText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  navLink: {
    padding: spacing.md,
  },
  navText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
});
