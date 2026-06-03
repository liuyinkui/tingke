import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getSummary, getStreak, LearningSummary, StreakData } from '../services/checkin';

interface Props {
  onStartLearning: () => void;
}

export default function StartScreen({ onStartLearning }: Props) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        setLoading(true);
        try {
          const [s, sm] = await Promise.all([
            getStreak(),
            getSummary(),
          ]);
          if (mounted) {
            setStreak(s);
            setSummary(sm);
          }
        } catch {
          // silently fail — home page works without stats
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  const streakCount = streak?.current_streak || 0;
  const todayCompleted = summary?.today?.completed ?? false;
  const todayAccuracy = summary?.today?.accuracy ?? 0;
  const todayMinutes = Math.round((summary?.today?.words_total || 0) / 10); // rough estimate: 10 words ≈ 1 min
  const weeklyMinutes = summary?.weekly_minutes || 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Streak */}
      <View style={styles.streakContainer}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{streakCount}</Text>
        <Text style={styles.streakLabel}>连续打卡</Text>
        {streakCount >= 7 && <Text style={styles.streakMilestone}>🏆</Text>}
      </View>

      {/* Streak dots */}
      {streakCount > 0 && (
        <View style={styles.streakDotsRow}>
          {Array.from({ length: Math.min(streakCount, 14) }, (_, i) => (
            <View
              key={i}
              style={[
                styles.streakDot,
                { backgroundColor: i < streakCount % 14 ? '#FF6B35' : '#E0E0E0' },
              ]}
            />
          ))}
        </View>
      )}

      {/* Weekly summary or today's status */}
      <View style={styles.statsContainer}>
        {todayCompleted ? (
          // Today completed state
          <View style={styles.completedBadge}>
            <Text style={styles.completedEmoji}>✅</Text>
            <Text style={styles.completedText}>今日已完成</Text>
            <Text style={styles.completedAccuracy}>
              辨音准确率 {todayAccuracy}%
            </Text>
            <Text style={styles.completedSubtext}>
              本周已学 {weeklyMinutes} 分钟
            </Text>
          </View>
        ) : (
          // Daily snippet — not yet started
          <View style={styles.dailyInfo}>
            <Text style={styles.dailyLabel}>今日练习</Text>
            <Text style={styles.dailyTime}>{todayMinutes} 分 {todayMinutes > 0 ? `${(todayMinutes % 1) * 60} 秒` : ''}</Text>
            {weeklyMinutes > 0 && (
              <Text style={styles.weeklyLabel}>本周 {weeklyMinutes} 分钟</Text>
            )}
          </View>
        )}
      </View>

      {/* Today's accuracy vs yesterday (if completed) */}
      {todayCompleted && summary?.today?.change_vs_yesterday !== null && summary?.today?.change_vs_yesterday !== undefined && (
        <View style={styles.changeRow}>
          <Text
            style={[
              styles.changeText,
              {
                color:
                  (summary?.today?.change_vs_yesterday || 0) >= 0
                    ? '#00B894'
                    : '#FF6B6B',
              },
            ]}
          >
            {summary?.today?.change_vs_yesterday !== null && summary?.today?.change_vs_yesterday !== undefined
              ? (summary.today.change_vs_yesterday >= 0
                  ? `↑${summary.today.change_vs_yesterday}%`
                  : `↓${Math.abs(summary.today.change_vs_yesterday)}%`)
              : ''}{' '}
            比昨天
          </Text>
        </View>
      )}

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.startButton, todayCompleted && styles.startButtonDim]}
        onPress={onStartLearning}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>
          {todayCompleted ? '继续今日练习' : '开始今日练习'}
        </Text>
      </TouchableOpacity>

      {/* Bottom Links */}
      <View style={styles.linksContainer}>
        <Text style={styles.linkText}>素材库</Text>
        <Text style={styles.linkDivider}>·</Text>
        <Text style={styles.linkText}>个人中心</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 6,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FF6B35',
    fontVariant: ['tabular-nums'],
  },
  streakLabel: {
    fontSize: 16,
    color: '#636e72',
    fontWeight: '500',
  },
  streakMilestone: {
    fontSize: 20,
    marginLeft: 4,
  },
  streakDotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 32,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyInfo: {
    alignItems: 'center',
  },
  dailyLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 4,
  },
  dailyTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  weeklyLabel: {
    fontSize: 13,
    color: '#b2bec3',
  },
  completedBadge: {
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  completedEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B894',
    marginBottom: 4,
  },
  completedAccuracy: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
  },
  completedSubtext: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 2,
  },
  changeRow: {
    marginBottom: 32,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginBottom: 48,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDim: {
    opacity: 0.85,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#636e72',
  },
  linkDivider: {
    fontSize: 14,
    color: '#b2bec3',
  },
});
