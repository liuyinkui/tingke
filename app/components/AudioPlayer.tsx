/**
 * AudioPlayer — 音频播放器
 *
 * 视觉参考: v2-minimal/listen.html (播放控制区)
 * 功能: 播放/暂停, 复读, 变速, 进度条
 **/

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../theme';

const SPEED_OPTIONS = ['0.5×', '0.75×', '1.0×', '1.25×', '1.5×'] as const;

interface AudioPlayerProps {
  /** 当前段落序号 */
  segmentIndex: number;
  /** 段落总数 */
  totalSegments: number;
  /** 当前进度百分比 0-100 */
  progress?: number;
  /** 当前时间 / 总时间 */
  currentTime?: string;
  totalTime?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSpeedChange?: (speed: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  segmentIndex,
  totalSegments,
  progress = 35,
  currentTime = '0:23',
  totalTime = '1:30',
  onPlay,
  onPause,
  onPrev,
  onNext,
  onSpeedChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState('1.0×');

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, onPlay, onPause]);

  const handleSpeedChange = useCallback(
    (s: string) => {
      setSpeed(s);
      onSpeedChange?.(s);
    },
    [onSpeedChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.cover}>
        {/* 段落信息 */}
        <Text style={styles.label}>正在播放 · 第 {segmentIndex}/{totalSegments} 段</Text>

        {/* 文本提示 */}
        <Text style={styles.hint} numberOfLines={1}>
          {getSegmentHint(segmentIndex)}
        </Text>

        {/* 进度条 */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* 控制按钮 */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={onPrev} activeOpacity={0.6}>
            <Text style={styles.ctrlIcon}>⏪</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlBtn, styles.playBtn]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctrlIcon, styles.playIcon]}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctrlBtn} onPress={onNext} activeOpacity={0.6}>
            <Text style={styles.ctrlIcon}>⏩</Text>
          </TouchableOpacity>
        </View>

        {/* 变速选择 */}
        <View style={styles.speedRow}>
          {SPEED_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.speedBtn, speed === s && styles.speedBtnActive]}
              onPress={() => handleSpeedChange(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.speedText, speed === s && styles.speedTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

/** 占位提示文本 */
function getSegmentHint(index: number): string {
  const hints = [
    'The anthropocene is a proposed geological epoch...',
    'This term was popularized by...',
    'The concept challenges the traditional...',
    'Scientists continue to debate...',
  ];
  return hints[(index - 1) % hints.length] ?? '';
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    flexShrink: 0,
  },
  cover: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.sm,
  },
  label: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.brand,
    ...shadows.sm,
  },
  ctrlIcon: {
    fontSize: 14,
    color: colors.brand,
  },
  playIcon: {
    color: '#fff',
    fontSize: 16,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  speedBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  speedBtnActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  speedText: {
    fontSize: fontSize.captionL,
    color: colors.textSecondary,
  },
  speedTextActive: {
    color: colors.brand,
  },
});
