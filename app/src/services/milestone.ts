import apiClient from './api';

export interface MilestoneData {
  days_since_first_practice: number;
  is_milestone: boolean;
  milestone_type: 'day7' | 'day14' | 'day21' | 'day30' | 'day60' | 'day100' | null;
  milestone_day: number | null;
  streak_days: number;
  upcoming_milestone: {
    days: number;
    remaining: number;
    type: string;
  } | null;
  first_practice_date: string;
}

export interface ComparisonData {
  first_accuracy: number | null;
  recent_accuracy: number | null;
  improvement: number | null;
  days_since_start: number;
}

/**
 * Check if today is a milestone day.
 */
export async function checkMilestone(): Promise<MilestoneData> {
  const res = await apiClient.post<{ success: boolean; data: MilestoneData }>(
    '/user/milestone/check'
  );
  return res.data.data;
}

/**
 * Get first vs recent accuracy comparison.
 */
export async function getComparison(): Promise<ComparisonData> {
  const res = await apiClient.get<{ success: boolean; data: ComparisonData }>(
    '/user/stats/comparison'
  );
  return res.data.data;
}
