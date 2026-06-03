import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { checkMilestone, getComparison, MilestoneData, ComparisonData } from '../services/milestone';

interface Props {
  /** Called when popup is dismissed */
  onDismiss: () => void;
  /** Called when user taps action button */
  onAction?: () => void;
  /** For testing: force a specific milestone */
  forceMilestone?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MilestonePopup({ onDismiss, onAction, forceMilestone }: Props) {
  const [visible, setVisible] = useState(false);
  const [milestone, setMilestone] = useState<MilestoneData | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [milestoneType, setMilestoneType] = useState<string | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const [m, c] = await Promise.all([
          checkMilestone(),
          getComparison().catch(() => null),
        ]);

        setMilestone(m);
        setComparison(c);

        // Determine if we should show the popup
        let showType: string | null = null;

        if (forceMilestone) {
          showType = forceMilestone;
        } else if (m.is_milestone) {
          showType = m.milestone_type;
        }

        if (showType) {
          setMilestoneType(showType);
          setVisible(true);

          // Animate in
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 60,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // No milestone — auto-dismiss
          onDismiss();
        }
      } catch {
        onDismiss();
      }
    })();
  }, [forceMilestone]);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss();
    });
  };

  if (!visible || !milestoneType) return null;

  const isDay14 = milestoneType === 'day14';
  const isDay7 = milestoneType === 'day7';

  const firstAccuracy = comparison?.first_accuracy ?? 0;
  const recentAccuracy = comparison?.recent_accuracy ?? 0;
  const improvement = comparison?.improvement ?? null;

  const days = milestone?.days_since_first_practice ?? 0;
  const streak = milestone?.streak_days ?? 0;

  // Render Day 14 special card
  if (isDay14) {
    return (
      <Modal transparent visible={visible} animationType="none">
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.cardEmoji}>🎉</Text>
            <Text style={styles.cardTitle}>你已练习 {days} 天！</Text>

            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonCol}>
                <Text style={styles.comparisonLabel}>首次准确率</Text>
                <Text style={styles.comparisonValue}>{firstAccuracy}%</Text>
              </View>
              <View style={styles.comparisonArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
              <View style={styles.comparisonCol}>
                <Text style={styles.comparisonLabel}>最近准确率</Text>
                <Text style={[styles.comparisonValue, styles.comparisonValueRecent]}>
                  {recentAccuracy}%
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(firstAccuracy, 100)}%` },
                    styles.progressBarOld,
                  ]}
                />
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(recentAccuracy, 100)}%` },
                    styles.progressBarNew,
                  ]}
                />
              </View>
            </View>

            {improvement !== null && improvement !== undefined && (
              <Text style={styles.improvementText}>
                {(improvement as number) > 0 ? `📈 进步了 ${improvement}%` : '📊 保持稳定'}
              </Text>
            )}

            <Text style={styles.caption}>"你看，真的有进步"</Text>

            <TouchableOpacity style={styles.actionButton} onPress={handleDismiss} activeOpacity={0.8}>
              <Text style={styles.actionButtonText}>太棒了！</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  // Generic milestone card (day7, day21, etc.)
  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, styles.cardSmall, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.cardEmoji}>{isDay7 ? '🌟' : '🏆'}</Text>
          <Text style={styles.cardTitle}>
            {isDay7
              ? '🎉 已坚持一周！'
              : `🎉 已坚持 ${days} 天！`}
          </Text>

          <Text style={styles.streakText}>
            🔥 连续打卡 {streak} 天
          </Text>

          {improvement !== null && improvement !== undefined && (
            <Text style={styles.improvementText}>
              {(improvement as number) > 0
                ? `📈 准确率提升 ${improvement}%`
                : '继续练习，进步看得见'}
            </Text>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={handleDismiss} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>
              {isDay7 ? '继续坚持！' : '继续加油！'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: SCREEN_WIDTH - 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  cardSmall: {
    paddingVertical: 28,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 24,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  comparisonCol: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#636e72',
    fontVariant: ['tabular-nums'],
  },
  comparisonValueRecent: {
    color: '#00B894',
  },
  comparisonArrow: {},
  arrowText: {
    fontSize: 24,
    color: '#b2bec3',
  },
  progressBarContainer: {
    width: '100%',
    gap: 6,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarOld: {
    backgroundColor: '#b2bec3',
  },
  progressBarNew: {
    backgroundColor: '#00B894',
  },
  improvementText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: '#636e72',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
