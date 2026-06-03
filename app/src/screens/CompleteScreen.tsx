import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { checkin, getStreak, getSummary, StreakData, LearningSummary } from '../services/checkin';

interface Props {
  onFinish: () => void;
  onViewBlindWords?: () => void;
}

export default function CompleteScreen({ onFinish, onViewBlindWords }: Props) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [checkinResult, setCheckinResult] = useState<{ streak_count: number; already_checked_in: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        // Fire all requests in parallel
        const [ck, streakData, summaryData] = await Promise.all([
          checkin(),
          getStreak().catch(() => null),
          getSummary(),
        ]);

        setCheckinResult({ streak_count: ck.streak_count, already_checked_in: ck.already_checked_in });
        setStreak(streakData);
        setSummary(summaryData);

        // Trigger animations
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(streakAnim, {
            toValue: 1,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (err) {
        // Still show the page even if API fails
        setCheckinResult({ streak_count: 0, already_checked_in: false });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Data ──────────────────────────────────────────────

  const streakCount = checkinResult?.streak_count || streak?.current_streak || 0;
  const todayAccuracy = summary?.today?.accuracy ?? 0;
  const blindWordsCount = summary?.blind_words_count ?? 0;
  const change = summary?.today?.change_vs_yesterday;
  const todayCompleted = summary?.today?.completed ?? false;

  const getChangeText = () => {
    if (change === null || change === undefined) return '';
    if (change > 0) return `↑${change}%`;
    if (change < 0) return `↓${Math.abs(change)}%`;
    return '持平';
  };

  const getChangeColor = () => {
    if (change === null || change === undefined) return '#636e72';
    if (change > 0) return '#00B894';
    if (change < 0) return '#FF6B6B';
    return '#636e72';
  };

  // ── Render ────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top area: celebration */}
      <View style={styles.celebrationArea}>
        <Animated.View
          style={[
            styles.celebrationCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          今日练习完成！
        </Animated.Text>
      </View>

      {/* Stats cards */}
      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
        {/* Accuracy */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>辨音准确率</Text>
          <Text style={styles.statNumber}>{todayAccuracy}%</Text>
          {change !== null && change !== undefined && (
            <Text style={[styles.statChange, { color: getChangeColor() }]}>
              {getChangeText()} 比昨天
            </Text>
          )}
        </View>

        {/* Blind words */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={onViewBlindWords || (() => {})}
          activeOpacity={0.7}
        >
          <Text style={styles.statLabel}>盲区词汇</Text>
          <Text style={styles.statNumber}>{blindWordsCount}</Text>
          <Text style={styles.statLink}>查看 →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Streak */}
      <Animated.View
        style={[
          styles.streakContainer,
          { transform: [{ scale: streakAnim }] },
        ]}
      >
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{streakCount}</Text>
        <Text style={styles.streakLabel}>连续打卡</Text>
        <View style={styles.streakBar}>
          {Array.from({ length: Math.min(streakCount, 14) }, (_, i) => (
            <View
              key={i}
              style={[
                styles.streakDot,
                { backgroundColor: i < streakCount % 14 ? '#FF6B35' : '#E8E8E8' },
              ]}
            />
          ))}
        </View>
        {streakCount >= 7 && (
          <Text style={styles.streakMilestone}>🏆 已坚持一周！太棒了！</Text>
        )}
      </Animated.View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {blindWordsCount > 0 && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onViewBlindWords || (() => {})}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>📖 查看盲区词汇</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Share placeholder
            Alert.alert(
              '分享打卡',
              `我在听刻完成了今日精听训练！\n连续打卡 ${streakCount} 天 🔥`,
              [{ text: '知道了' }]
            );
          }}
        >
          <Text style={styles.primaryButtonText}>📤 分享打卡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={onFinish}
          activeOpacity={0.7}
        >
          <Text style={styles.finishButtonText}>明天继续 →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
  },
  celebrationArea: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  celebrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E3A5F',
    fontVariant: ['tabular-nums'],
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statLink: {
    fontSize: 12,
    color: '#1E3A5F',
    fontWeight: '500',
    marginTop: 4,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  streakEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FF6B35',
    fontVariant: ['tabular-nums'],
  },
  streakLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 12,
  },
  streakBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  streakMilestone: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 4,
  },
  actionRow: {
    gap: 12,
    paddingBottom: 24,
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
  finishButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#636e72',
  },
});
