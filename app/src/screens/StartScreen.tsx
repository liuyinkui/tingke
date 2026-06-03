import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Props {
  onStartLearning: () => void;
}

export default function StartScreen({ onStartLearning }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Streak */}
      <View style={styles.streakContainer}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakText}>连续打卡 0 天</Text>
      </View>

      {/* Daily Snippet */}
      <Text style={styles.dailyLabel}>今日练习</Text>
      <Text style={styles.dailyTime}>0 分 0 秒</Text>

      {/* Start Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={onStartLearning}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>开始今日练习</Text>
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  streakEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  streakText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
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
    marginBottom: 48,
  },
  startButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 48,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
