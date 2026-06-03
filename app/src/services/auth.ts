import apiClient from './api';
import { setToken, setStoredUser, StoredUser } from './storage';

export interface AuthResponse {
  token: string;
  user: StoredUser;
}

/**
 * Register a new user with just a nickname.
 */
export async function register(nickname: string): Promise<AuthResponse> {
  const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
    '/auth/register',
    { nickname }
  );
  const { token, user } = res.data.data;
  await setToken(token);
  await setStoredUser(user);
  return { token, user };
}

/**
 * Login with existing nickname.
 */
export async function login(nickname: string): Promise<AuthResponse> {
  const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
    '/auth/login',
    { nickname }
  );
  const { token, user } = res.data.data;
  await setToken(token);
  await setStoredUser(user);
  return { token, user };
}
