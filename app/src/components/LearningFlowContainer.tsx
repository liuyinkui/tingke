import React, { useState, useCallback } from 'react';
import BlindListeningScreen from '../screens/BlindListeningScreen';
import DictationScreen from '../screens/DictationScreen';
import FollowAlongScreen from '../screens/FollowAlongScreen';
import CompleteScreen from '../screens/CompleteScreen';
import { fetchMaterialDetail, MaterialDetail } from '../services/materials';

type Step = 'blind' | 'dictation' | 'follow' | 'complete';

interface LearningFlowContainerProps {
  onExit: () => void;
  /** Optional: pre-select a material by ID */
  materialId?: string;
}

/**
 * LearningFlowContainer
 *
 * Manages the complete learning flow state machine.
 * If materialId is provided, that specific material is used.
 * Otherwise, the daily recommended material is fetched.
 */
export default function LearningFlowContainer({ onExit, materialId }: LearningFlowContainerProps) {
  const [currentStep, setCurrentStep] = useState<Step>('blind');
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [preloadedMaterial, setPreloadedMaterial] = useState<MaterialDetail | null>(null);

  // Preload specific material if materialId is provided
  React.useEffect(() => {
    if (materialId) {
      (async () => {
        try {
          const detail = await fetchMaterialDetail(materialId);
          setPreloadedMaterial(detail);
        } catch {
          // Fall back to daily material
        }
      })();
    }
  }, [materialId]);

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

  const handleFinish = useCallback(() => {
    onExit();
  }, [onExit]);

  // Render based on current step
  switch (currentStep) {
    case 'blind':
      return (
        <BlindListeningScreen
          preloadedMaterial={preloadedMaterial}
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
      return (
        <CompleteScreen onFinish={handleFinish} />
      );

    default:
      return null;
  }
}
