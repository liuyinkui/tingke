import apiClient from './api';
import { MaterialDetail } from './materials';

/**
 * Fetch today's recommended material.
 * Returns full material detail including sentence_timeline.
 */
export async function fetchDailyMaterial(): Promise<MaterialDetail> {
  const res = await apiClient.get<{ success: boolean; data: MaterialDetail }>(
    '/user/daily-material'
  );
  return res.data.data;
}
