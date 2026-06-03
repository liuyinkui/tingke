import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <View style={[styles.line, isDone ? styles.lineDone : styles.linePending]} />
              )}
              <View
                style={[
                  styles.dot,
                  isDone && styles.dotDone,
                  isActive && styles.dotActive,
                  !isDone && !isActive && styles.dotPending,
                ]}
              >
                {isDone ? (
                  <Text style={styles.dotCheck}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.dotNum,
                      isActive && styles.dotNumActive,
                      !isActive && !isDone && styles.dotNumPending,
                    ]}
                  >
                    {stepNum}
                  </Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          return (
            <Text
              key={i}
              style={[
                styles.label,
                isActive && styles.labelActive,
                isDone && styles.labelDone,
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: '#E8F8F5',
  },
  dotActive: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dotPending: {
    backgroundColor: '#DFE6E9',
  },
  dotCheck: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '700',
  },
  dotNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  dotNumActive: {
    color: '#FFFFFF',
  },
  dotNumPending: {
    color: '#B2BEC3',
  },
  line: {
    width: 32,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 4,
  },
  lineDone: {
    backgroundColor: '#00B894',
  },
  linePending: {
    backgroundColor: '#DFE6E9',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B2BEC3',
    textAlign: 'center',
  },
  labelActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  labelDone: {
    color: '#00B894',
  },
});
