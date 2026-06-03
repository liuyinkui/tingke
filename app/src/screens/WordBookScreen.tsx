import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  SectionList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { fetchWords, markMastered, fetchWordStats, WordEntry, WordStats } from '../services/words';

interface Props {
  onBack: () => void;
}

export default function WordBookScreen({ onBack }: Props) {
  const [sections, setSections] = useState<Array<{ title: string; data: WordEntry[] }>>([]);
  const [stats, setStats] = useState<WordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [masteredFilter, setMasteredFilter] = useState<'all' | 'unmastered' | 'mastered'>('unmastered');

  const loadData = useCallback(
    async (resetPage = false) => {
      try {
        const currentPage = resetPage ? 1 : page;
        const params: any = { page: currentPage, limit: 50 };
        if (masteredFilter === 'unmastered') params.mastered = 'false';
        else if (masteredFilter === 'mastered') params.mastered = 'true';

        const [wordData, statsData] = await Promise.all([
          fetchWords(params),
          fetchWordStats().catch(() => null),
        ]);

        // Build sections from grouped words
        const newSections = wordData.dates.map((date: string) => {
          const words = wordData.words[date];
          // Format date label
          const d = new Date(date);
          const label = `${d.getMonth() + 1}/${d.getDate()} ${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`;
          return { title: label, data: words || [] };
        });

        if (resetPage) {
          setSections(newSections);
        } else {
          setSections((prev) => [...prev, ...newSections]);
        }

        setTotalPages(wordData.pagination.total_pages);
        setStats(statsData);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [page, masteredFilter]
  );

  // Reload on filter change
  useEffect(() => {
    setPage(1);
    setLoading(true);
    loadData(true);
  }, [masteredFilter]);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [masteredFilter])
  );

  const handleMarkMastered = async (id: string, word: string) => {
    try {
      await markMastered(id);
      setSections((prev) =>
        prev
          .map((s) => ({
            ...s,
            data: s.data.filter((w) => w.id !== id),
          }))
          .filter((s) => s.data.length > 0)
      );
      Alert.alert('已标记', `"${word}" 已标记为已掌握`);
    } catch {
      Alert.alert('操作失败', '请重试');
    }
  };

  const handleWordPress = (entry: WordEntry) => {
    // Show word details with original sentence
    Alert.alert(
      entry.word,
      `原文句子：\n"${entry.sentence}"\n\n${entry.is_mastered ? '✅ 已掌握' : '📝 待复习'}`,
      [
        { text: '关闭', style: 'cancel' },
        ...(!entry.is_mastered
          ? [
              {
                text: '标记已掌握',
                onPress: () => handleMarkMastered(entry.id, entry.word),
              },
            ]
          : []),
      ]
    );
  };

  const filterTabs = [
    { key: 'unmastered', label: '待复习' },
    { key: 'mastered', label: '已掌握' },
    { key: 'all', label: '全部' },
  ] as const;

  const renderWordItem = ({ item }: { item: WordEntry }) => (
    <TouchableOpacity
      style={[styles.wordItem, item.is_mastered && styles.wordItemMastered]}
      onPress={() => handleWordPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.wordContent}>
        <Text style={[styles.wordText, item.is_mastered && styles.wordTextMastered]}>
          {item.word}
        </Text>
        <Text style={styles.wordSentence} numberOfLines={1}>
          {item.sentence}
        </Text>
      </View>

      {!item.is_mastered && (
        <TouchableOpacity
          style={styles.masteredButton}
          onPress={() => handleMarkMastered(item.id, item.word)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.masteredButtonText}>✓</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string; data: WordEntry[] } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} 个词</Text>
    </View>
  );

  if (loading && sections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1E3A5F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>单词本</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Stats bar */}
      {stats && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.unmastered}</Text>
            <Text style={styles.statLabel}>待复习</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.mastered}</Text>
            <Text style={styles.statLabel}>已掌握</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>总计</Text>
          </View>
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              masteredFilter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setMasteredFilter(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                masteredFilter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Word list */}
      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyText}>
            {masteredFilter === 'unmastered' ? '暂无盲区词汇' : '暂无单词数据'}
          </Text>
          <Text style={styles.emptySubtext}>完成听写后，错词会自动收录到这里</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderWordItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (page < totalPages) setPage((p) => p + 1);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
    width: 60,
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
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  statLabel: {
    fontSize: 11,
    color: '#636e72',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterTabActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  filterTabText: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
  },
  sectionCount: {
    fontSize: 12,
    color: '#b2bec3',
  },
  wordItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordItemMastered: {
    opacity: 0.6,
  },
  wordContent: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  wordTextMastered: {
    textDecorationLine: 'line-through',
    color: '#b2bec3',
  },
  wordSentence: {
    fontSize: 13,
    color: '#636e72',
  },
  masteredButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  masteredButtonText: {
    fontSize: 16,
    color: '#00B894',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#b2bec3',
    textAlign: 'center',
  },
});
