import React, { useState, useCallback } from 'react';
import BlindListeningScreen from '../screens/BlindListeningScreen';
import DictationScreen from '../screens/DictationScreen';
import { MaterialDetail } from '../services/materials';

type Step = 'blind' | 'dictation' | 'complete';

interface LearningFlowContainerProps {
  onExit: () => void;
}

/**
 * LearningFlowContainer
 *
 * Manages the complete learning flow state machine:
 *   BlindListening → Dictation → Complete
 *
 * StartScreen 中的"开始今日练习"会渲染此组件，
 * 替代 tab 导航直到学习流完成。
 */
export default function LearningFlowContainer({ onExit }: LearningFlowContainerProps) {
  const [currentStep, setCurrentStep] = useState<Step>('blind');
  const [material, setMaterial] = useState<MaterialDetail | null>(null);

  const handleBlindComplete = useCallback((m: MaterialDetail) => {
    setMaterial(m);
    setCurrentStep('dictation');
  }, []);

  const handleDictationComplete = useCallback(() => {
    setCurrentStep('complete');
  }, []);

  // Render based on current step
  switch (currentStep) {
    case 'blind':
      return (
        <BlindListeningScreen
          onComplete={handleBlindComplete}
          onExit={onExit}
        />
      );

    case 'dictation':
      if (!material) return null;
      return (
        <DictationScreen
          material={material}
          onComplete={handleDictationComplete}
          onExit={onExit}
        />
      );

    case 'complete':
      // Issue #13 will implement the completion screen
      // For now, just exit back to home
      if (material) {
        // Placeholder: will be replaced by CompleteScreen
        onExit();
      }
      return null;

    default:
      return null;
  }
}
