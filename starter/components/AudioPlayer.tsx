// 听刻 · 音频播放器组件
// 参考：design-spec.html §④
// 功能：波形可视化 · 播放/暂停 · 变速 · 单句循环 · AB段循环

import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

type Speed = 0.5 | 0.75 | 1 | 1.25 | 1.5;

interface AudioPlayerProps {
  source: string;
  currentSentence: string;
  onProgress?: (current: number, total: number) => void;
  onComplete?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  source,
  currentSentence,
  onProgress,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState<'none' | 'single' | 'ab'>('none');

  // TODO: 接入 react-native-track-player 或 react-native-sound
  // 波形可视化使用 react-native-svg

  return (
    <View style={styles.container}>
      {/* 波形图 */}
      <View style={styles.waveform}>
        <Text style={styles.waveformPlaceholder}>▂▃▄▅▆▇▆▅▄▃▂</Text>
      </View>

      {/* 当前句子 */}
      <Text style={styles.sentence} numberOfLines={2}>
        {currentSentence}
      </Text>

      {/* 播放控制 */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏪</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏩</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* 底部工具栏 */}
      <View style={styles.toolbar}>
        {/* 时间 */}
        <Text style={styles.time}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>

        {/* 变速 */}
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => {
            const speeds: Speed[] = [0.5, 0.75, 1, 1.25, 1.5];
            const idx = speeds.indexOf(speed);
            setSpeed(speeds[(idx + 1) % speeds.length]);
          }}
        >
          <Text style={styles.toolText}>{speed}x</Text>
        </TouchableOpacity>

        {/* 单句循环 */}
        <TouchableOpacity
          style={[styles.toolBtn, loopMode === 'single' && styles.toolBtnActive]}
          onPress={() => setLoopMode(loopMode === 'single' ? 'none' : 'single')}
        >
          <Text style={[styles.toolText, loopMode === 'single' && styles.toolTextActive]}>
            🔂
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    // shadow
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  waveform: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  waveformPlaceholder: {
    fontSize: 36,
    color: colors.primary,
    letterSpacing: 2,
  },
  sentence: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.base,
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  controlBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  playIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: fontSize.caption,
    color: colors.textHint,
  },
  toolBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    marginLeft: spacing.sm,
  },
  toolBtnActive: {
    backgroundColor: colors.accent,
  },
  toolText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  toolTextActive: {
    color: '#FFFFFF',
  },
});
