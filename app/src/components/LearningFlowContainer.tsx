import React, { useState, useCallback } from 'react';
import { MaterialDetail } from '../services/materials';
import BlindListeningScreen from '../screens/BlindListeningScreen';

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

  // Render based on current step
  switch (currentStep) {
    case 'blind':
      return (
        <BlindListeningScreen
          onComplete={handleBlindComplete}
          onExit={onExit}
        />
      );

    // Dictation and Complete steps will be implemented in subsequent issues
    case 'dictation':
    case 'complete':
    default:
      return <BlindListeningScreen onComplete={handleBlindComplete} onExit={onExit} />;
  }
}
