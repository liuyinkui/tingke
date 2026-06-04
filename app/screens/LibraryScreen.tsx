/**
 * LibraryScreen — 素材库
 *
 * 视觉参考: v2-minimal/library.html
 * 功能: 搜索, 分类筛选, 素材列表, 底部Tab导航
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, radius, shadows } from '../theme';
import { Material, Difficulty } from '../types';

interface LibraryScreenProps {
  navigation?: any;
}

// —— 模拟素材数据 ——
const MOCK_MATERIALS: (Material & { isLearned?: boolean; isNew?: boolean; isHot?: boolean })[] = [
  {
    id: '1', title: '人类世的终结', titleEn: 'The End of the Anthropocene',
    difficulty: 'intermediate', duration: 900, audioUrl: '', source: 'CET-6',
    sentences: [], tags: [], isLearned: true,
  },
  {
    id: '2', title: '火星移民计划', titleEn: 'The Mars Colonization Plan',
    difficulty: 'advanced', duration: 720, audioUrl: '', source: 'CET-6',
    sentences: [], tags: [], isNew: true,
  },
  {
    id: '3', title: '气候变化的影响', titleEn: 'Impacts of Climate Change',
    difficulty: 'beginner', duration: 600, audioUrl: '', source: 'VOA',
    sentences: [], tags: [],
  },
  {
    id: '4', title: '人工智能的未来', titleEn: 'The Future of AI',
    difficulty: 'intermediate', duration: 1080, audioUrl: '', source: 'CET-4',
    sentences: [], tags: [], isHot: true,
  },
  {
    id: '5', title: '全球化与本土文化', titleEn: 'Globalization and Local Culture',
    difficulty: 'beginner', duration: 480, audioUrl: '', source: 'VOA',
    sentences: [], tags: [],
  },
];

const FILTERS = ['全部', 'CET-4', 'CET-6', 'VOA', '学术', '生活', 'TED'];

const DIFFICULTY_MAP: Record<Difficulty, { label: string; class: string }> = {
  beginner: { label: '初级', class: 'e' },
  intermediate: { label: '中级', class: 'm' },
  advanced: { label: '高级', class: 'h' },
};

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchText, setSearchText] = useState('');

  const handleMaterialPress = useCallback(
    (material: Material) => {
      navigation?.navigate('Listen', { materialId: material.id });
    },
    [navigation],
  );

  const getDifficultyStyle = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return styles.diffEasy;
      case 'intermediate':
        return styles.diffMid;
      case 'advanced':
        return styles.diffHard;
    }
  };

  const getDifficultyTextStyle = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return styles.diffEasyText;
      case 'intermediate':
        return styles.diffMidText;
      case 'advanced':
        return styles.diffHardText;
    }
  };

  const getModuleEmoji = (material: Material) => {
    const parts: string[] = [];
    parts.push('🎧');
    parts.push('✍️');
    if (material.duration >= 900) {
      parts.push('🗣️');
    }
    return parts.join(' ');
  };

  const getMinutes = (seconds: number) => `${Math.round(seconds / 60)}min`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.container}>
        {/* 顶部 */}
        <View style={styles.top}>
          <Text style={styles.ttl}>素材库</Text>
          <TouchableOpacity style={styles.favBtn}>
            <Text style={styles.favText}>❤️ 收藏</Text>
          </TouchableOpacity>
        </View>

        {/* 搜索条 */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索素材..."
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* 分类过滤器 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterBtn,
                activeFilter === filter && styles.filterBtnActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  activeFilter === filter && styles.filterBtnTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 素材列表 */}
        <FlatList
          data={MOCK_MATERIALS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.materialCard}
              onPress={() => handleMaterialPress(item)}
              activeOpacity={0.7}
            >
              {/* 头部 */}
              <View style={styles.materialHeader}>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialTitle}>{item.title}</Text>
                  <Text style={styles.materialEn}>{item.titleEn}</Text>
                </View>
                <View style={[styles.difficultyTag, getDifficultyStyle(item.difficulty)]}>
                  <Text style={[styles.difficultyText, getDifficultyTextStyle(item.difficulty)]}>
                    {DIFFICULTY_MAP[item.difficulty].label}
                  </Text>
                </View>
              </View>

              {/* 底部元信息 */}
              <View style={styles.materialMeta}>
                <Text style={styles.materialModules}>{getModuleEmoji(item)}</Text>
                <View style={styles.materialTimeRow}>
                  <Text style={styles.materialTime}>{getMinutes(item.duration)}</Text>
                  {item.isLearned && <Text style={styles.materialStatus}> · 已学</Text>}
                  {item.isNew && <Text style={styles.materialNew}> · 新增</Text>}
                  {item.isHot && <Text style={styles.materialHot}> · 热门</Text>}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* 底部 Tab 栏（渲染在原生 TabNavigator 中，本页不做硬编码） */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
  },
  // —— 顶部 ——
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.base,
  },
  ttl: {
    fontSize: fontSize.titleM,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  favBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  favText: {
    fontSize: fontSize.bodyS,
    color: colors.brand,
  },
  // —— 搜索 ——
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.base,
  },
  searchIcon: {
    fontSize: fontSize.bodyS,
    color: colors.textTertiary,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: fontSize.bodyS,
    color: colors.textPrimary,
    fontFamily: 'PingFang SC',
    paddingLeft: spacing.md,
  },
  // —— 过滤器 ——
  filterRow: {
    flexShrink: 0,
    marginBottom: spacing.base,
  },
  filterContent: {
    paddingBottom: spacing.sm,
    gap: spacing.md,
    flexDirection: 'row',
  },
  filterBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  filterBtnActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  filterBtnText: {
    fontSize: fontSize.captionL,
    color: colors.textSecondary,
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  // —— 列表 ——
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  materialCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  materialInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  materialTitle: {
    fontSize: fontSize.bodyM,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  materialEn: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  difficultyTag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  difficultyText: {
    fontSize: fontSize.captionM,
    fontWeight: '600',
  },
  // 难度色
  diffEasy: {
    backgroundColor: 'rgba(46,204,113,0.1)',
  },
  diffEasyText: {
    color: colors.success,
  },
  diffMid: {
    backgroundColor: colors.brandLight,
  },
  diffMidText: {
    color: colors.brand,
  },
  diffHard: {
    backgroundColor: 'rgba(231,76,60,0.08)',
  },
  diffHardText: {
    color: colors.error,
  },
  // —— 底部元信息 ——
  materialMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  materialModules: {
    fontSize: fontSize.captionM,
    color: colors.textTertiary,
  },
  materialTimeRow: {
    flexDirection: 'row',
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
  },
  materialTime: {
    fontSize: fontSize.captionL,
    color: colors.textTertiary,
  },
  materialStatus: {
    fontSize: fontSize.captionL,
    color: colors.success,
  },
  materialNew: {
    fontSize: fontSize.captionL,
    color: colors.brand,
  },
  materialHot: {
    fontSize: fontSize.captionL,
    color: colors.brand,
  },
});
