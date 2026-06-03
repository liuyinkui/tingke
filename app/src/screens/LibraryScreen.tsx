import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMaterials, DIFFICULTY_CONFIG, formatDuration, formatDate, MaterialSummary } from '../services/materials';

interface Props {
  onSelectMaterial?: (materialId: string) => void;
}

const TOPICS = ['all', 'cet-4', 'cet-6', 'voa', 'voa-slow', 'voa-standard', 'ted', '考研'];
const TOPIC_LABELS: Record<string, string> = {
  all: '全部',
  'cet-4': '四级',
  'cet-6': '六级',
  voa: 'VOA',
  'voa-slow': 'VOA慢速',
  'voa-standard': 'VOA常速',
  ted: 'TED',
  考研: '考研',
};

const DIFFICULTIES = ['all', 'L1', 'L2', 'L3', 'L4', 'L5'];
const DIFFICULTY_LABELS: Record<string, string> = {
  all: '全部',
  ...Object.fromEntries(
    Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => [k, v.label.split('·')[0].trim()])
  ),
};

export default function LibraryScreen({ onSelectMaterial }: Props) {
  const [materials, setMaterials] = useState<MaterialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [difficulty, setDifficulty] = useState('all');
  const [topic, setTopic] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMaterials = useCallback(
    async (isRefresh = false) => {
      try {
        const params: any = { page: isRefresh ? 1 : page, limit: 20 };
        if (difficulty !== 'all') params.difficulty = difficulty;
        if (topic !== 'all') params.topic = topic;

        const data = await fetchMaterials(params);

        if (isRefresh || page === 1) {
          setMaterials(data.materials);
        } else {
          setMaterials((prev) => [...prev, ...data.materials]);
        }
        setTotalPages(data.pagination.total_pages);
      } catch {
        // silently fail — data stays as-is
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [difficulty, topic, page]
  );

  // Load on mount and when filters change
  useEffect(() => {
    setPage(1);
    setLoading(true);
    loadMaterials(true);
  }, [difficulty, topic]);

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadMaterials(true);
    }, [difficulty, topic])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadMaterials(true);
  };

  const onEndReached = () => {
    if (page < totalPages && !loading) {
      setPage((p) => p + 1);
    }
  };

  const renderMaterialCard = ({ item }: { item: MaterialSummary }) => {
    const config = DIFFICULTY_CONFIG[item.difficulty] || DIFFICULTY_CONFIG.L1;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectMaterial?.(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.completed && <Text style={styles.completedBadge}>✅ 已完成</Text>}
        </View>

        <View style={styles.cardMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: config.color + '20' }]}>
            <Text style={[styles.difficultyText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.metaText}>⏱ {formatDuration(item.duration)}</Text>
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>

        {item.topics && item.topics.length > 0 && (
          <View style={styles.topicsRow}>
            {item.topics.slice(0, 3).map((t) => (
              <View key={t} style={styles.topicTag}>
                <Text style={styles.topicTagText}>
                  {TOPIC_LABELS[t] || t}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterBar = () => (
    <View>
      {/* Difficulty filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={DIFFICULTIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = difficulty === item;
          const config = item !== 'all' ? DIFFICULTY_CONFIG[item] : null;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                active && { backgroundColor: config?.color || '#1E3A5F' },
              ]}
              onPress={() => setDifficulty(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {DIFFICULTY_LABELS[item]}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Topic filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TOPICS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = topic === item;
          return (
            <TouchableOpacity
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setTopic(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {TOPIC_LABELS[item]}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  if (loading && materials.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>素材库</Text>
      </View>

      {/* Filters */}
      {renderFilterBar()}

      {/* Material list */}
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        renderItem={renderMaterialCard}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无素材</Text>
            <Text style={styles.emptySubtext}>切换筛选条件试试</Text>
          </View>
        }
        ListFooterComponent={
          page < totalPages ? (
            <ActivityIndicator style={{ padding: 20 }} color="#1E3A5F" />
          ) : null
        }
      />
    </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterChipActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  filterChipText: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
    marginRight: 8,
  },
  completedBadge: {
    fontSize: 12,
    color: '#00B894',
    fontWeight: '500',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: '#636e72',
  },
  topicsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  topicTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topicTagText: {
    fontSize: 11,
    color: '#636e72',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#b2bec3',
  },
});
