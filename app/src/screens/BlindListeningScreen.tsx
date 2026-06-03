import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import StepIndicator from '../components/StepIndicator';
import AudioPlayer from '../components/AudioPlayer';
import { fetchDailyMaterial } from '../services/learning';
import { fetchMaterialDetail, MaterialDetail } from '../services/materials';

interface Props {
  onComplete: (material: MaterialDetail) => void;
  onExit: () => void;
  /** Optional: pre-loaded material (from library selection) */
  preloadedMaterial?: MaterialDetail | null;
}

const STEP_LABELS = ['盲听', '听写', '跟读'];

export default function BlindListeningScreen({ onComplete, onExit, preloadedMaterial }: Props) {
  const [material, setMaterial] = useState<MaterialDetail | null>(preloadedMaterial || null);
  const [loading, setLoading] = useState(!preloadedMaterial);
  const [error, setError] = useState<string | null>(null);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // If preloaded, no need to fetch
    if (preloadedMaterial) {
      setMaterial(preloadedMaterial);
      setAudioUrl(preloadedMaterial.audio_url);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await fetchDailyMaterial();
        setMaterial(data);
        setAudioUrl(data.audio_url);
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || '无法加载素材';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [preloadedMaterial]);

  const handleProgress = useCallback(
    (_currentMs: number) => {
      if (!hasListened) setHasListened(true);
    },
    [hasListened]
  );

  const handleReplay = useCallback(() => {
    setHasListened(true);
  }, []);

  const handleProceed = useCallback(() => {
    if (material) onComplete(material);
  }, [material, onComplete]);

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>加载素材...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error
  if (error || !material) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>📭</Text>
          <Text style={styles.errorText}>{error || '暂无可用素材'}</Text>
          <TouchableOpacity style={styles.exitButton} onPress={onExit} activeOpacity={0.8}>
            <Text style={styles.exitButtonText}>返回首页</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <StepIndicator currentStep={1} totalSteps={3} labels={STEP_LABELS} />
        <TouchableOpacity style={styles.closeButton} onPress={onExit} activeOpacity={0.7}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionHeader}>先听一遍，不要看原文</Text>

        <AudioPlayer
          audioUrl={audioUrl || material.audio_url}
          sentenceTimeline={material.sentence_timeline}
          currentSentenceIndex={currentSentence}
          onProgress={handleProgress}
          onSentenceChange={setCurrentSentence}
        />

        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            原文已隐藏，专注听就好。{'\n'}
            可以反复听，直到你有把握为止。
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleReplay}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>🔁 再听一遍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, !hasListened && styles.primaryButtonDim]}
          onPress={handleProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            听懂了，开始听写 →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  loadingText: { marginTop: 16, fontSize: 15, color: '#636e72' },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, color: '#636e72', textAlign: 'center', marginBottom: 24 },
  topBar: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 8, paddingRight: 16 },
  closeButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06,
    shadowRadius: 4, elevation: 2, marginTop: 12,
  },
  closeIcon: { fontSize: 16, color: '#636e72', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  sectionHeader: { fontSize: 15, fontWeight: '500', color: '#636e72', textAlign: 'center' },
  hintBox: { backgroundColor: '#F0F4F8', borderRadius: 12, padding: 16, alignItems: 'center' },
  hintText: { fontSize: 13, color: '#636e72', textAlign: 'center', lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  secondaryButton: {
    flex: 1, height: 50, backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#DFE6E9', alignItems: 'center', justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '500', color: '#636e72' },
  primaryButton: { flex: 2, height: 50, backgroundColor: '#1E3A5F', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonDim: { opacity: 0.6 },
  primaryButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  exitButton: { backgroundColor: '#1E3A5F', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  exitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
