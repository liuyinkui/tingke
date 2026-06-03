import apiClient from './api';

export interface MaterialSummary {
  id: string;
  title: string;
  difficulty: string;
  duration: number;
  topics: string[];
  created_at: string;
  completed: boolean;
}

export interface MaterialDetail extends MaterialSummary {
  audio_url: string;
  transcript: string;
  sentence_timeline: Array<{
    index: number;
    start_ms: number;
    end_ms: number;
    text: string;
  }>;
  word_list: any;
  status: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    materials: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

interface DetailResponse {
  success: boolean;
  data: MaterialDetail;
}

/**
 * Fetch material list with optional filters.
 */
export async function fetchMaterials(params?: {
  difficulty?: string;
  topic?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<MaterialSummary>['data']> {
  const query = new URLSearchParams();
  if (params?.difficulty) query.set('difficulty', params.difficulty);
  if (params?.topic) query.set('topic', params.topic);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await apiClient.get<PaginatedResponse<MaterialSummary>>(
    `/materials?${query.toString()}`
  );
  return res.data.data;
}

/**
 * Fetch material detail by ID.
 */
export async function fetchMaterialDetail(id: string): Promise<MaterialDetail> {
  const res = await apiClient.get<DetailResponse>(`/materials/${id}`);
  return res.data.data;
}

/**
 * Difficulty display config.
 */
export const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  L1: { label: 'L1 · 入门', color: '#00B894' },
  L2: { label: 'L2 · 基础', color: '#00cec9' },
  L3: { label: 'L3 · 中级', color: '#0984e3' },
  L4: { label: 'L4 · 高级', color: '#e17055' },
  L5: { label: 'L5 · 挑战', color: '#d63031' },
};

/**
 * Format duration in seconds to mm:ss.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format date string.
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
