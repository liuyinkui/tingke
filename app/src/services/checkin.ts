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
  overall_accuracy: number;
  blind_words_count: number;
  completed_materials: number;
  today: {
    accuracy: number;
    words_correct: number;
    words_total: number;
    change_vs_yesterday: number | null;
  };
}

/**
 * POST /api/user/checkin — 每日打卡
 */
export async function checkin(): Promise<CheckinResult> {
  const res = await apiClient.post<{ success: boolean; data: CheckinResult }>(
    '/user/checkin'
  );
  return res.data.data;
}

/**
 * GET /api/user/streak — 打卡 streak 数据
 */
export async function getStreak(): Promise<StreakData> {
  const res = await apiClient.get<{ success: boolean; data: StreakData }>(
    '/user/streak'
  );
  return res.data.data;
}

/**
 * GET /api/user/stats/summary — 学习统计概览
 */
export async function getSummary(): Promise<LearningSummary> {
  const res = await apiClient.get<{ success: boolean; data: LearningSummary }>(
    '/user/stats/summary'
  );
  return res.data.data;
}
