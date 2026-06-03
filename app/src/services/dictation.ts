import apiClient from './api';

export interface DictationResult {
  id: string;
  sentence_index: number;
  correct: (string | null)[];
  user: (string | null)[];
  errors: Array<{
    index: number;
    expected: string;
    received: string | null;
  }>;
  accuracy: number;
  total_words: number;
  correct_count: number;
  is_correct: boolean;
}

export interface DictationProgress {
  material_id: string;
  total_sentences: number;
  completed_sentences: number;
  progress: number;
  overall_accuracy: number;
  completed_indices: number[];
}

/**
 * Submit one sentence of dictation.
 */
export async function submitDictation(
  materialId: string,
  sentenceIndex: number,
  userText: string
): Promise<DictationResult> {
  const res = await apiClient.post<{ success: boolean; data: DictationResult }>(
    '/user/dictation/submit',
    {
      material_id: materialId,
      sentence_index: sentenceIndex,
      user_text: userText,
    }
  );
  return res.data.data;
}

/**
 * Get dictation progress for a material.
 */
export async function getDictationProgress(
  materialId: string
): Promise<DictationProgress> {
  const res = await apiClient.get<{ success: boolean; data: DictationProgress }>(
    `/user/dictation/progress?material_id=${materialId}`
  );
  return res.data.data;
}
