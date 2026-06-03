import apiClient from './api';

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string | null;
  level: string;
  daily_goal: number;
  accent_pref: string;
  total_days: number;
  weekly_minutes: number;
  current_streak: number;
  created_at: string;
}

export interface ProfileUpdate {
  daily_goal?: 15 | 30 | 45;
  accent_pref?: 'us' | 'uk';
  level?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
}

/**
 * Fetch current user profile + stats.
 */
export async function getProfile(): Promise<UserProfile> {
  const res = await apiClient.get<{ success: boolean; data: UserProfile }>(
    '/user/profile'
  );
  return res.data.data;
}

/**
 * Update user settings.
 */
export async function updateProfile(updates: ProfileUpdate): Promise<void> {
  await apiClient.patch('/user/profile', updates);
}
