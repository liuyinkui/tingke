import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, LinearGradient, Stop, Defs } from 'react-native-svg';

interface WaveformProps {
  /** Total duration in ms */
  durationMs: number;
  /** Current playback position in ms */
  currentMs: number;
  /** Sentence boundaries for highlighting */
  sentenceTimeline?: Array<{ start_ms: number; end_ms: number; text: string }>;
  /** Current sentence index */
  activeSentenceIndex?: number;
  /** Called when user taps/drags to a position (ms) */
  onSeek?: (ms: number) => void;
  /** Width of the component */
  width: number;
  /** Height of the component */
  height?: number;
}

const BAR_COUNT = 120;
const BAR_MIN_HEIGHT = 4;
const BAR_MAX_HEIGHT = 60;

/**
 * Simulated waveform visualization using SVG bars.
 *
 * Generates pseudo-random bars that look like an audio waveform.
 * The played portion is highlighted with the accent color.
 */
export default function Waveform({
  durationMs,
  currentMs,
  sentenceTimeline,
  activeSentenceIndex,
  onSeek,
  width,
  height = 80,
}: WaveformProps) {
  // Generate stable pseudo-random bar heights based on index
  const bars = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      // Deterministic pseudo-random using sin
      const r = Math.abs(Math.sin(i * 1.7 + 0.3)) * 0.6 + 0.4;
      result.push(BAR_MIN_HEIGHT + r * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT));
    }
    return result;
  }, []);

  const progress = durationMs > 0 ? Math.min(currentMs / durationMs, 1) : 0;
  const barWidth = (width - 4) / BAR_COUNT;
  const barGap = 1.5;

  // Calculate sentence highlight segments
  const sentenceSegments = useMemo(() => {
    if (!sentenceTimeline || durationMs <= 0) return [];
    return sentenceTimeline.map((s) => ({
      startRatio: s.start_ms / durationMs,
      endRatio: s.end_ms / durationMs,
    }));
  }, [sentenceTimeline, durationMs]);

  const handlePress = (event: any) => {
    if (!onSeek || durationMs <= 0) return;
    const x = event.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(x / width, 1));
    onSeek(ratio * durationMs);
  };

  return (
    <View style={[styles.container, { height }]} onStartShouldSetResponder={() => true} onResponderRelease={handlePress}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#00B894" stopOpacity="0.3" />
            <Stop offset="0.5" stopColor="#00B894" stopOpacity="0.6" />
            <Stop offset="1" stopColor="#1E3A5F" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {bars.map((barHeight, i) => {
          const x = 2 + i * (barWidth + barGap);
          const barProgress = (i + 0.5) / BAR_COUNT;
          const isPlayed = barProgress <= progress;
          const isInActiveSentence =
            activeSentenceIndex !== undefined &&
            activeSentenceIndex >= 0 &&
            sentenceSegments[activeSentenceIndex] &&
            barProgress >= sentenceSegments[activeSentenceIndex].startRatio &&
            barProgress <= sentenceSegments[activeSentenceIndex].endRatio;

          let fill = '#E0E0E0'; // unplayed
          if (isPlayed) fill = isInActiveSentence ? '#00B894' : '#1E3A5F';

          return (
            <Rect
              key={i}
              x={x}
              y={(height - barHeight) / 2}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill={fill}
              opacity={isPlayed ? 1 : 0.5}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});
