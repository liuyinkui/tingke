import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getProfile, updateProfile, UserProfile } from '../services/profile';

interface Props {
  onBack: () => void;
}

const GOAL_OPTIONS = [15, 30, 45] as const;
const ACCENT_OPTIONS = [
  { value: 'us', label: '美式发音' },
  { value: 'uk', label: '英式发音' },
] as const;
const LEVEL_OPTIONS = [
  { value: 'L1', label: 'L1 — VOA 慢速' },
  { value: 'L2', label: 'L2 — CET-4 / VOA 常速' },
  { value: 'L3', label: 'L3 — CET-6 / 考研' },
  { value: 'L4', label: 'L4 — TED / 雅思' },
  { value: 'L5', label: 'L5 — 经济学人 / 深度访谈' },
] as const;

export default function SettingsScreen({ onBack }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [goal, setGoal] = useState<number>(15);
  const [accent, setAccent] = useState<'us' | 'uk'>('us');
  const [level, setLevel] = useState<string>('L1');

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setGoal(data.daily_goal);
        setAccent(data.accent_pref as 'us' | 'uk');
        setLevel(data.level);
      } catch {
        Alert.alert('错误', '无法加载个人设置');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasChanges = goal !== profile?.daily_goal ||
    accent !== profile?.accent_pref ||
    level !== profile?.level;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ daily_goal: goal as 15 | 30 | 45, accent_pref: accent, level: level as any });
      Alert.alert('保存成功', '设置已更新');
      onBack();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || '保存失败';
      Alert.alert('保存失败', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>编辑设置</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Daily Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>每日目标</Text>
        <View style={styles.optionRow}>
          {GOAL_OPTIONS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.optionChip, goal === g && styles.optionChipActive]}
              onPress={() => setGoal(g)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionChipText, goal === g && styles.optionChipTextActive]}>
                {g} 分钟
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Accent Preference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>口音偏好</Text>
        <View style={styles.optionRow}>
          {ACCENT_OPTIONS.map((a) => (
            <TouchableOpacity
              key={a.value}
              style={[styles.optionChip, accent === a.value && styles.optionChipActive]}
              onPress={() => setAccent(a.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionChipText, accent === a.value && styles.optionChipTextActive]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前水平</Text>
        <View style={styles.levelList}>
          {LEVEL_OPTIONS.map((l) => (
            <TouchableOpacity
              key={l.value}
              style={[styles.levelItem, level === l.value && styles.levelItemActive]}
              onPress={() => setLevel(l.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, level === l.value && styles.radioActive]} />
              <Text style={[styles.levelText, level === l.value && styles.levelTextActive]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!hasChanges || saving) && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={!hasChanges || saving}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>
          {saving ? '保存中...' : '保存设置'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  backText: {
    fontSize: 16,
    color: '#1E3A5F',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  optionChipActive: {
    borderColor: '#1E3A5F',
    backgroundColor: '#EBF0F7',
  },
  optionChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#636e72',
  },
  optionChipTextActive: {
    color: '#1E3A5F',
    fontWeight: '600',
  },
  levelList: {
    gap: 8,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  levelItemActive: {
    borderColor: '#1E3A5F',
    backgroundColor: '#EBF0F7',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#b2bec3',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#1E3A5F',
  },
  levelText: {
    fontSize: 15,
    color: '#636e72',
  },
  levelTextActive: {
    color: '#1E3A5F',
    fontWeight: '600',
  },
  saveButton: {
    marginHorizontal: 20,
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
