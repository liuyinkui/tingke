import apiClient from './api';

export interface CheckinResult {
  already_checked_in: boolean;
  id?: string;
  checkin_date?: string;
  streak_count: number;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  today_checked_in: boolean;
  first_checkin_date: string | null;
}

export interface LearningSummary {
  total_days: number;
  weekly_minutes: number;
  overall_accuracy: number;
  blind_words_count: number;
  mastered_words_count: number;
  completed_materials: number;
  today: {
    accuracy: number;
    words_correct: number;
    words_total: number;
    change_vs_yesterday: number | null;
    completed: boolean;
  };
}

export interface TrendPoint {
  date: string;
  accuracy: number | null;
  words: number;
}

export interface ComparisonData {
  first_accuracy: number | null;
  recent_accuracy: number | null;
  improvement: number | null;
  days_since_start: number;
  first_practice_date: string | null;
  recent_practice_date: string | null;
}

export async function checkin(): Promise<CheckinResult> {
  const res = await apiClient.post<{ success: boolean; data: CheckinResult }>('/user/checkin');
  return res.data.data;
}

export async function getStreak(): Promise<StreakData> {
  const res = await apiClient.get<{ success: boolean; data: StreakData }>('/user/streak');
  return res.data.data;
}

export async function getSummary(): Promise<LearningSummary> {
  const res = await apiClient.get<{ success: boolean; data: LearningSummary }>('/user/stats/summary');
  return res.data.data;
}

export async function getTrend(days = 30): Promise<TrendPoint[]> {
  const res = await apiClient.get<{ success: boolean; data: { trend: TrendPoint[] } }>(
    `/user/stats/trend?days=${days}`
  );
  return res.data.data.trend;
}

export async function getComparison(): Promise<ComparisonData> {
  const res = await apiClient.get<{ success: boolean; data: ComparisonData }>(
    '/user/stats/comparison'
  );
  return res.data.data;
}
