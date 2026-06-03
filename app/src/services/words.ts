import apiClient from './api';

export interface WordEntry {
  id: string;
  word: string;
  sentence: string;
  is_mastered: boolean;
  created_at: string;
  material_id: string;
}

export interface WordListData {
  words: Record<string, WordEntry[]>;
  dates: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface WordStats {
  total: number;
  mastered: number;
  unmastered: number;
}

/**
 * Fetch word list (unmastered by default), grouped by date.
 */
export async function fetchWords(params?: {
  page?: number;
  limit?: number;
  mastered?: string;
}): Promise<WordListData> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.mastered) query.set('mastered', params.mastered);

  const res = await apiClient.get<{ success: boolean; data: WordListData }>(
    `/user/words?${query.toString()}`
  );
  return res.data.data;
}

/**
 * Mark a word as mastered (remove from blind zone).
 */
export async function markMastered(id: string): Promise<void> {
  await apiClient.delete(`/user/words/${id}`);
}

/**
 * Fetch word stats.
 */
export async function fetchWordStats(): Promise<WordStats> {
  const res = await apiClient.get<{ success: boolean; data: WordStats }>(
    '/user/words/stats'
  );
  return res.data.data;
}
