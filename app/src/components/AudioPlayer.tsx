import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutChangeEvent,
  PanResponder,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Waveform from './Waveform';

// ── Types ──────────────────────────────────────────────────

export interface SentenceTimelineItem {
  index?: number;
  start_ms: number;
  end_ms: number;
  text: string;
}

export interface AudioPlayerProps {
  /** URL or local path to audio file */
  audioUrl: string;
  /** Sentence timeline for the current material */
  sentenceTimeline?: SentenceTimelineItem[];
  /** Controlled: external sentence index */
  currentSentenceIndex?: number;
  /** Called with current playback position in ms */
  onProgress?: (currentMs: number) => void;
  /** Called when the active sentence changes */
  onSentenceChange?: (index: number) => void;
  /** Called when playback ends */
  onPlaybackEnd?: () => void;
}

type LoopMode = 'none' | 'sentence' | 'ab';

// ── Component ──────────────────────────────────────────────

export default function AudioPlayer({
  audioUrl,
  sentenceTimeline,
  currentSentenceIndex,
  onProgress,
  onSentenceChange,
  onPlaybackEnd,
}: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const positionRef = useRef(0);
  const durationRef = useRef(0);
  const isPlayingRef = useRef(false);
  const loopModeRef = useRef<LoopMode>('none');
  const abStartRef = useRef<number | null>(null);
  const abEndRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [abStart, setAbStart] = useState<number | null>(null);
  const [abEnd, setAbEnd] = useState<number | null>(null);
  const [waveformWidth, setWaveformWidth] = useState(0);

  const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];

  // ── Format helpers ─────────────────────────────────────

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Load audio ─────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, progressUpdateIntervalMillis: 250 }
      );

      if (!mounted) {
        await sound.unloadAsync();
        return;
      }

      soundRef.current = sound;
      if (status.isLoaded) {
        durationRef.current = status.durationMillis || 0;
        setDuration(status.durationMillis || 0);
        setIsLoaded(true);
      }

      // Listen for playback status updates
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    };

    load();

    return () => {
      mounted = false;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [audioUrl]);

  // ── Playback status handler ────────────────────────────

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      positionRef.current = status.positionMillis || 0;
      isPlayingRef.current = status.isPlaying || false;
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying || false);

      // Check if playback ended
      if (status.didJustFinish) {
        handlePlaybackEnd();
      }
    },
    [onPlaybackEnd]
  );

  // ── Progress polling (for smooth UI updates) ───────────

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (soundRef.current) {
          // position is already updated via onPlaybackStatusUpdate
        }
        onProgress?.(positionRef.current);

        // Check sentence boundaries
        if (sentenceTimeline && sentenceTimeline.length > 0 && onSentenceChange) {
          const currentPos = positionRef.current;
          for (let i = sentenceTimeline.length - 1; i >= 0; i--) {
            if (currentPos >= sentenceTimeline[i].start_ms) {
              onSentenceChange(i);
              break;
            }
          }
        }

        // Check loop boundaries
        checkLoops();
      }, 200);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, sentenceTimeline]);

  // ── Loop checking ──────────────────────────────────────

  const checkLoops = useCallback(() => {
    const pos = positionRef.current;

    // Sentence loop
    if (loopModeRef.current === 'sentence' && sentenceTimeline && currentSentenceIndex !== undefined) {
      const sentence = sentenceTimeline[currentSentenceIndex];
      if (sentence && pos >= sentence.end_ms) {
        seekTo(sentence.start_ms);
      }
    }

    // AB loop
    if (loopModeRef.current === 'ab' && abStartRef.current !== null && abEndRef.current !== null) {
      if (pos >= abEndRef.current) {
        seekTo(abStartRef.current);
      }
    }
  }, [sentenceTimeline, currentSentenceIndex]);

  // ── Playback controls ──────────────────────────────────

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    if (isPlayingRef.current) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, []);

  const seekTo = useCallback(async (ms: number) => {
    if (!soundRef.current) return;
    const clampedMs = Math.max(0, Math.min(ms, durationRef.current));
    await soundRef.current.setPositionAsync(clampedMs);
    positionRef.current = clampedMs;
    setPosition(clampedMs);
  }, []);

  const handlePlaybackEnd = useCallback(() => {
    onPlaybackEnd?.();
  }, [onPlaybackEnd]);

  // ── Speed control ──────────────────────────────────────

  const cycleSpeed = useCallback(async () => {
    if (!soundRef.current) return;
    const currentIndex = SPEED_OPTIONS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const nextSpeed = SPEED_OPTIONS[nextIndex];
    setSpeed(nextSpeed);
    await soundRef.current.setRateAsync(nextSpeed, true);
  }, [speed]);

  // ── Sentence loop ──────────────────────────────────────

  const toggleSentenceLoop = useCallback(() => {
    if (loopMode === 'sentence') {
      loopModeRef.current = 'none';
      setLoopMode('none');
    } else {
      loopModeRef.current = 'sentence';
      setLoopMode('sentence');
      // Jump to current sentence start
      if (sentenceTimeline && currentSentenceIndex !== undefined && sentenceTimeline[currentSentenceIndex]) {
        seekTo(sentenceTimeline[currentSentenceIndex].start_ms);
      }
    }
  }, [loopMode, sentenceTimeline, currentSentenceIndex]);

  // ── AB loop ────────────────────────────────────────────

  const setAbPoint = useCallback(
    (point: 'A' | 'B') => {
      const pos = positionRef.current;

      if (point === 'A') {
        setAbStart(pos);
        abStartRef.current = pos;
        // Clear B if A > B
        if (abEnd !== null && pos >= abEnd) {
          setAbEnd(null);
          abEndRef.current = null;
        }
      } else {
        if (abStart === null) return; // Need A first
        if (pos <= abStart) return; // B must be after A
        setAbEnd(pos);
        abEndRef.current = pos;
        loopModeRef.current = 'ab';
        setLoopMode('ab');
        seekTo(abStart);
      }
    },
    [abStart, abEnd]
  );

  const clearAbLoop = useCallback(() => {
    abStartRef.current = null;
    abEndRef.current = null;
    loopModeRef.current = 'none';
    setAbStart(null);
    setAbEnd(null);
    setLoopMode('none');
  }, []);

  // ── Waveform seek ──────────────────────────────────────

  const handleSeek = useCallback(
    (ms: number) => {
      seekTo(ms);
    },
    [seekTo]
  );

  // ── Progress bar pan responder ─────────────────────────

  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        if (waveformWidth > 0 && duration > 0) {
          const ratio = Math.max(0, Math.min(x / waveformWidth, 1));
          seekTo(ratio * duration);
        }
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        if (waveformWidth > 0 && duration > 0) {
          const ratio = Math.max(0, Math.min(x / waveformWidth, 1));
          seekTo(ratio * duration);
        }
      },
    })
  ).current;

  // ── Get current sentence text ──────────────────────────

  const currentSentenceText =
    sentenceTimeline && currentSentenceIndex !== undefined && sentenceTimeline[currentSentenceIndex]
      ? sentenceTimeline[currentSentenceIndex].text
      : null;

  // ── Render ─────────────────────────────────────────────

  const isSentenceLooping = loopMode === 'sentence';
  const isAbLooping = loopMode === 'ab';

  return (
    <View style={styles.container}>
      {/* Current sentence display */}
      {currentSentenceText && (
        <View style={styles.sentenceDisplay}>
          <Text style={styles.sentenceText} numberOfLines={3}>
            {currentSentenceText}
          </Text>
        </View>
      )}

      {/* Waveform */}
      <View
        onLayout={(e: LayoutChangeEvent) => setWaveformWidth(e.nativeEvent.layout.width)}
        {...progressPanResponder.panHandlers}
      >
        {waveformWidth > 0 && (
          <Waveform
            width={waveformWidth}
            height={80}
            durationMs={duration}
            currentMs={position}
            sentenceTimeline={sentenceTimeline}
            activeSentenceIndex={currentSentenceIndex}
            onSeek={handleSeek}
          />
        )}
      </View>

      {/* Time display */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Progress bar (thin) */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' },
          ]}
        />
      </View>

      {/* Controls row */}
      <View style={styles.controlsRow}>
        {/* AB loop controls */}
        <View style={styles.abControls}>
          <TouchableOpacity
            style={[styles.abButton, abStart !== null && styles.abButtonActive]}
            onPress={() => setAbPoint('A')}
            activeOpacity={0.6}
          >
            <Text style={[styles.abButtonText, abStart !== null && styles.abButtonTextActive]}>
              A
            </Text>
          </TouchableOpacity>

          {abStart !== null && (
            <TouchableOpacity
              style={[styles.abButton, abEnd !== null && styles.abButtonActive]}
              onPress={() => setAbPoint('B')}
              activeOpacity={0.6}
            >
              <Text style={[styles.abButtonText, abEnd !== null && styles.abButtonTextActive]}>
                B
              </Text>
            </TouchableOpacity>
          )}

          {isAbLooping && (
            <TouchableOpacity style={styles.abClearButton} onPress={clearAbLoop} activeOpacity={0.6}>
              <Text style={styles.abClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sentence loop */}
        <TouchableOpacity
          style={[styles.controlButton, isSentenceLooping && styles.controlButtonActive]}
          onPress={toggleSentenceLoop}
          activeOpacity={0.6}
        >
          <Text style={[styles.controlIcon, isSentenceLooping && styles.controlIconActive]}>
            🔄
          </Text>
          <Text style={[styles.controlLabel, isSentenceLooping && styles.controlLabelActive]}>
            单句
          </Text>
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
          activeOpacity={0.7}
          disabled={!isLoaded}
        >
          <Text style={styles.playIcon}>
            {isPlaying ? '⏸' : '▶️'}
          </Text>
        </TouchableOpacity>

        {/* Speed */}
        <TouchableOpacity
          style={[styles.controlButton, speed !== 1 && styles.controlButtonActive]}
          onPress={cycleSpeed}
          activeOpacity={0.6}
        >
          <Text style={[styles.speedText, speed !== 1 && styles.speedTextActive]}>
            {speed}x
          </Text>
          <Text style={[styles.controlLabel, speed !== 1 && styles.controlLabelActive]}>
            变速
          </Text>
        </TouchableOpacity>

        {/* Spacer for AB controls */}
        <View style={{ width: 80 }} />
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sentenceDisplay: {
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  sentenceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2D3436',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#636e72',
    fontVariant: ['tabular-nums'],
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1E3A5F',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
  },
  controlButtonActive: {
    backgroundColor: '#EBF0F7',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  controlIcon: {
    fontSize: 18,
  },
  controlIconActive: {
    color: '#1E3A5F',
  },
  controlLabel: {
    fontSize: 10,
    color: '#636e72',
    marginTop: 2,
  },
  controlLabelActive: {
    color: '#1E3A5F',
    fontWeight: '600',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 24,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
  },
  speedTextActive: {
    color: '#1E3A5F',
  },
  abControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  abButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  abButtonActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  abButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#636e72',
  },
  abButtonTextActive: {
    color: '#FFFFFF',
  },
  abClearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  abClearText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
