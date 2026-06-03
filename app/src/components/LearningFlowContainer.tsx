import React, { useState, useCallback } from 'react';
import BlindListeningScreen from '../screens/BlindListeningScreen';
import DictationScreen from '../screens/DictationScreen';
import FollowAlongScreen from '../screens/FollowAlongScreen';
import { MaterialDetail } from '../services/materials';

type Step = 'blind' | 'dictation' | 'follow' | 'complete';

interface LearningFlowContainerProps {
  onExit: () => void;
}

/**
 * LearningFlowContainer
 *
 * Manages the complete learning flow state machine:
 *   BlindListening → Dictation → FollowAlong → Complete
 */
export default function LearningFlowContainer({ onExit }: LearningFlowContainerProps) {
  const [currentStep, setCurrentStep] = useState<Step>('blind');
  const [material, setMaterial] = useState<MaterialDetail | null>(null);

  const handleBlindComplete = useCallback((m: MaterialDetail) => {
    setMaterial(m);
    setCurrentStep('dictation');
  }, []);

  const handleDictationComplete = useCallback(() => {
    setCurrentStep('follow');
  }, []);

  const handleFollowComplete = useCallback(() => {
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

    case 'follow':
      if (!material) return null;
      return (
        <FollowAlongScreen
          material={material}
          onComplete={handleFollowComplete}
          onExit={onExit}
        />
      );

    case 'complete':
      // Issue #13 will implement the completion screen
      onExit();
      return null;

    default:
      return null;
  }
}
