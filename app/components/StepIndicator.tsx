/**
 * StepIndicator — 三步进度指示器（盲听 → 听写 → 跟读）
 *
 * 视觉参考: v2-minimal/listen.html
 * 设计Token: base-guide.md
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme';

export type StepStatus = 'completed' | 'active' | 'pending';

export interface StepConfig {
  label: string;
  status: StepStatus;
}

const STEPS: { label: string; key: string }[] = [
  { label: '盲听', key: 'listen' },
  { label: '听写', key: 'dictation' },
  { label: '跟读', key: 'shadowing' },
];

interface StepIndicatorProps {
  currentStep: number; // 1-based: 1=盲听, 2=听写, 3=跟读
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const status: StepStatus =
          stepNum < currentStep ? 'completed' : stepNum === currentStep ? 'active' : 'pending';

        return (
          <React.Fragment key={step.key}>
            <View style={styles.stepItem}>
              {/* 圆点 */}
              <View style={[styles.dot, styles[`dot_${status}` as keyof typeof styles]]}>
                <Text style={[styles.dotText, styles[`dotText_${status}` as keyof typeof styles]]}>
                  {status === 'completed' ? '✓' : stepNum}
                </Text>
              </View>
              {/* 标签 */}
              <Text style={[styles.label, styles[`label_${status}` as keyof typeof styles]]}>
                {step.label}
              </Text>
            </View>
            {/* 连接线 */}
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  status === 'completed' || (status === 'active' && stepNum === currentStep - 1)
                    ? styles.connectorActive
                    : styles.connectorPending,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  stepItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  // — 圆点 —
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot_completed: {
    backgroundColor: colors.success,
  },
  dot_active: {
    backgroundColor: colors.brand,
  },
  dot_pending: {
    backgroundColor: colors.divider,
  },
  dotText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dotText_completed: {
    color: '#fff',
  },
  dotText_active: {
    color: '#fff',
  },
  dotText_pending: {
    color: colors.textTertiary,
  },
  // — 标签 —
  label: {
    fontSize: fontSize.captionM,
    marginTop: spacing.sm,
  },
  label_completed: {
    color: colors.success,
    fontWeight: '600',
  },
  label_active: {
    color: colors.brand,
    fontWeight: '600',
  },
  label_pending: {
    color: colors.textTertiary,
  },
  // — 连接线 —
  connector: {
    width: 28,
    height: 1.5,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  connectorPending: {
    backgroundColor: colors.divider,
  },
  connectorActive: {
    backgroundColor: colors.brand,
  },
});
