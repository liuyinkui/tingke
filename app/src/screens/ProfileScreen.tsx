import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, UserProfile } from '../services/profile';

interface Props {
  onNavigateToSettings: () => void;
  onNavigateToWordBook: () => void;
}

export default function ProfileScreen({ onNavigateToSettings, onNavigateToWordBook }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await getProfile();
          if (!cancelled) setProfile(data);
        } catch {
          if (!cancelled) setProfile(null);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  const levelLabel: Record<string, string> = {
    L1: 'VOA 慢速',
    L2: 'CET-4 / VOA 常速',
    L3: 'CET-6 / 考研',
    L4: 'TED / 雅思',
    L5: '经济学人 / 深度访谈',
  };

  const accentLabel: Record<string, string> = {
    us: '美式发音',
    uk: '英式发音',
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(user?.nickname || '?')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nickname}>{user?.nickname || '用户'}</Text>
        <Text style={styles.level}>
          {profile?.level || 'L1'} · {levelLabel[profile?.level || 'L1']}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>连续打卡</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.total_days || 0}</Text>
          <Text style={styles.statLabel}>累计天数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.weekly_minutes || 0}</Text>
          <Text style={styles.statLabel}>本周分钟</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>学习设置</Text>

        <TouchableOpacity style={styles.settingItem} activeOpacity={0.6}>
          <View>
            <Text style={styles.settingLabel}>每日目标</Text>
            <Text style={styles.settingValue}>{profile?.daily_goal || 15} 分钟</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} activeOpacity={0.6}>
          <View>
            <Text style={styles.settingLabel}>口音偏好</Text>
            <Text style={styles.settingValue}>
              {accentLabel[profile?.accent_pref || 'us']}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} activeOpacity={0.6}>
          <View>
            <Text style={styles.settingLabel}>当前水平</Text>
            <Text style={styles.settingValue}>
              {profile?.level || 'L1'} — {levelLabel[profile?.level || 'L1']}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Word Book Entry */}
      <TouchableOpacity
        style={styles.wordBookButton}
        onPress={onNavigateToWordBook}
        activeOpacity={0.8}
      >
        <Text style={styles.wordBookButtonEmoji}>📖</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.wordBookButtonTitle}>单词本</Text>
          <Text style={styles.wordBookButtonSub}>查看听写中写错的词</Text>
        </View>
        <Text style={styles.wordBookArrow}>→</Text>
      </TouchableOpacity>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={onNavigateToSettings}
        activeOpacity={0.8}
      >
        <Text style={styles.editButtonText}>编辑设置</Text>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  level: {
    fontSize: 13,
    color: '#636e72',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
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
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3436',
  },
  wordBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordBookButtonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  wordBookButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  wordBookButtonSub: {
    fontSize: 13,
    color: '#636e72',
  },
  wordBookArrow: {
    fontSize: 18,
    color: '#b2bec3',
  },
  editButton: {
    marginHorizontal: 20,
    backgroundColor: '#1E3A5F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
