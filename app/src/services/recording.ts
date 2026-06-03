import apiClient from './api';

export interface PhonemeDetail {
  phoneme: string;
  score: number;
  suggestions: string[];
}

export interface WordDetail {
  word: string;
  score: number;
  phonemes: PhonemeDetail[];
}

export interface RecordingResult {
  id: string;
  score: number;
  details: WordDetail[];
  audio_url: string;
}

export interface CompareInfo {
  original_audio_url: string;
  user_audio_url: string;
  score: number;
  details: WordDetail[];
  transcript: string;
  recorded_at: string;
}

/**
 * Submit a recording for evaluation.
 */
export async function submitRecording(
  audioUri: string,
  materialId: string,
  sentenceIndex?: number
): Promise<RecordingResult> {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/wav',
    name: 'recording.wav',
  } as any);
  formData.append('material_id', materialId);
  if (sentenceIndex !== undefined) {
    formData.append('sentence_index', String(sentenceIndex));
  }

  const res = await apiClient.post<{ success: boolean; data: RecordingResult }>(
    '/user/recording/submit',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, // 30s for upload + evaluation
    }
  );
  return res.data.data;
}

/**
 * Get comparison info for a recording.
 */
export async function getCompare(id: string): Promise<CompareInfo> {
  const res = await apiClient.get<{ success: boolean; data: CompareInfo }>(
    `/user/recording/${id}/compare`
  );
  return res.data.data;
}
