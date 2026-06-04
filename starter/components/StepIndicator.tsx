// 听刻 · 三步进度指示器
// 盲听 → 听写 → 跟读
// 参考：design-system.md §9.2

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

const STEPS = ['盲听', '听写', '跟读'];

interface StepIndicatorProps {
  currentStep: number; // 1, 2, 3
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const isCurrent = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={label}>
            {/* 步骤圆点 */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.dot,
                  isCurrent && styles.dotCurrent,
                  isCompleted && styles.dotCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.dotText,
                    (isCurrent || isCompleted) && styles.dotTextActive,
                  ]}
                >
                  {isCompleted ? '✓' : stepNum}
                </Text>
              </View>
              <Text
                style={[
                  styles.label,
                  isCurrent && styles.labelCurrent,
                  isCompleted && styles.labelCompleted,
                ]}
              >
                {label}
              </Text>
            </View>

            {/* 连接线 */}
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  stepNum < currentStep && styles.connectorCompleted,
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
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCurrent: {
    borderColor: colors.accent,
    backgroundColor: '#FFF5F0',
  },
  dotCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  dotText: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.textHint,
  },
  dotTextActive: {
    color: colors.accent,
  },
  label: {
    fontSize: fontSize.tag,
    color: colors.textHint,
    marginTop: spacing.xs,
  },
  labelCurrent: {
    color: colors.accent,
    fontWeight: '600',
  },
  labelCompleted: {
    color: colors.success,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
});
