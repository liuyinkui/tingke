/**
 * AudioPlayer — 本地 WAV 音频播放器（基于 expo-av）
 *
 * 使用 expo-av Audio.Sound 播放 assets/audio/sentence_N.wav 本地音频文件。
 * 不再依赖 Web Speech TTS，保证 Expo web / native 正常工作。
 *
 * 视觉: v2-minimal 绿白灰极简风，品牌色 #02B47F
 *
 * Props:
 *   sentences     - 句子数组 (保持兼容，内部通过索引映射到 sentence_N.wav)
 *   currentIndex  - 当前播放的句子索引 (0-based)
 *   onIndexChange - 句子切换回调
 *   autoPlay      - 自动开始播放
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { audioService } from '../services/speechService';
import { colors, spacing, fontSize, radius, shadows } from '../theme';

const SPEED_OPTIONS = ['0.5×', '0.75×', '1.0×', '1.25×', '1.5×'] as const;
const SPEED_VALUES: Record<string, number> = {
  '0.5×': 0.5,
  '0.75×': 0.75,
  '1.0×': 1.0,
  '1.25×': 1.25,
  '1.5×': 1.5,
};

// —— Props ——

interface AudioPlayerProps {
  sentences: string[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  autoPlay?: boolean;
}

// —— Component ——

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  sentences,
  currentIndex,
  onIndexChange,
  autoPlay = false,
}) => {
  // Refs for real-time access
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(currentIndex);
  const sentencesRef = useRef(sentences);
  const speedRef = useRef(1.0);
  const mountedRef = useRef(true);
  const autoPlayedRef = useRef(false);

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<string>('1.0×');
  const [progress, setProgress] = useState(0); // 0~100
  const [duration, setDuration] = useState(0);  // ms
  const [position, setPosition] = useState(0);  // ms

  // Sync refs
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    sentencesRef.current = sentences;
  }, [sentences]);

  useEffect(() => {
    mountedRef.current = true;

    // 加载所有音频
    audioService.loadSentences();

    // 注册播放状态更新
    audioService.onPlaybackStatusUpdate = (status) => {
      if (!mountedRef.current) return;
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);

      const dur = status.durationMillis;
      const pos = status.positionMillis;
      if (dur > 0 && pos >= 0) {
        setProgress(Math.min((pos / dur) * 100, 99.5));
      }
    };

    // 注册播放完成回调
    audioService.onEnd = () => {
      if (!mountedRef.current) return;
      setIsPlaying(false);
      setIsPaused(false);
      isPlayingRef.current = false;
      setProgress(100);
    };

    return () => {
      mountedRef.current = false;
      audioService.onPlaybackStatusUpdate = null;
      audioService.onEnd = null;
      audioService.stop();
    };
  }, []);

  // Auto-play
  useEffect(() => {
    if (autoPlay && !autoPlayedRef.current && sentences.length > 0) {
      autoPlayedRef.current = true;
      const timer = setTimeout(() => {
        playCurrent();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  // —— Play/Pause current sentence ——

  const playCurrent = useCallback(async () => {
    const idx = currentIndexRef.current;
    const text = sentencesRef.current[idx];
    if (!text) return;

    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);

    await audioService.playSentence(idx);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlayingRef.current) {
      if (audioService.isPaused()) {
        audioService.resume();
        setIsPaused(false);
      } else {
        audioService.pause();
        setIsPaused(true);
      }
    } else {
      playCurrent();
    }
  }, [playCurrent]);

  // —— Navigate sentences ——

  const handlePrev = useCallback(() => {
    const next = Math.max(0, currentIndexRef.current - 1);
    onIndexChange?.(next);
    // Auto-play prev
    setTimeout(() => playCurrent(), 100);
  }, [onIndexChange, playCurrent]);

  const handleNext = useCallback(() => {
    const next = Math.min(sentencesRef.current.length - 1, currentIndexRef.current + 1);
    onIndexChange?.(next);
    setTimeout(() => playCurrent(), 100);
  }, [onIndexChange, playCurrent]);

  // —— Speed change ——

  const handleSpeedChange = useCallback((s: string) => {
    const val = SPEED_VALUES[s] ?? 1.0;
    speedRef.current = val;
    setSpeed(s);
    audioService.setSpeed(val);
  }, []);

  // —— Seek progress bar ——

  const [progressBarWidth, setProgressBarWidth] = useState(0);

  const onProgressBarLayout = useCallback((e: LayoutChangeEvent) => {
    setProgressBarWidth(e.nativeEvent.layout.width);
  }, []);

  const seekTo = useCallback(
    (ratio: number) => {
      const dur = audioService.getDurationMillis();
      if (dur > 0) {
        const targetMs = Math.floor(ratio * dur);
        audioService.seekTo(targetMs);
        setProgress(ratio * 100);
      }
    },
    [],
  );

  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        if (progressBarWidth > 0) {
          const ratio = Math.max(0, Math.min(x / progressBarWidth, 1));
          seekTo(ratio);
        }
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        if (progressBarWidth > 0) {
          const ratio = Math.max(0, Math.min(x / progressBarWidth, 1));
          seekTo(ratio);
        }
      },
    }),
  ).current;

  // —— Helpers ——

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSentence = sentences[currentIndex] ?? '';

  return (
    <View style={styles.container}>
      <View style={styles.cover}>
        {/* 段落信息 */}
        <Text style={styles.label}>
          正在播放 · 第 {currentIndex + 1}/{sentences.length} 句
        </Text>

        {/* 当前句子 */}
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceText} numberOfLines={3}>
            {currentSentence}
          </Text>
        </View>

        {/* 时间显示 */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>

        {/* 可拖拽进度条 */}
        <View
          style={styles.progressBar}
          onLayout={onProgressBarLayout}
          {...progressPanResponder.panHandlers}
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
          <View style={[styles.progressThumb, { left: `${progress}%` }]} />
        </View>

        {/* 控制按钮 */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={handlePrev}
            activeOpacity={0.6}
            disabled={currentIndex <= 0}
          >
            <Text style={[styles.ctrlIcon, currentIndex <= 0 && styles.ctrlIconDisabled]}>
              ⏪
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlBtn, styles.playBtn]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctrlIcon, styles.playIcon]}>
              {isPaused ? '▶' : isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={handleNext}
            activeOpacity={0.6}
            disabled={currentIndex >= sentences.length - 1}
          >
            <Text
              style={[
                styles.ctrlIcon,
                currentIndex >= sentences.length - 1 && styles.ctrlIconDisabled,
              ]}
            >
              ⏩
            </Text>
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

// —— Styles ——

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
  sentenceBox: {
    backgroundColor: colors.brandLight,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
    minHeight: 56,
  },
  sentenceText: {
    fontSize: fontSize.bodyS,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  timeText: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    marginBottom: spacing.base,
    justifyContent: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.brand,
    marginLeft: -7,
    top: -4,
    ...shadows.sm,
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
  ctrlIconDisabled: {
    opacity: 0.3,
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
