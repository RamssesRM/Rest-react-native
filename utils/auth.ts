import * as SecureStore from 'expo-secure-store';
import useUserStore from '@/hooks/use-userstore';

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

export const validateStoredTokens = async (): Promise<boolean> => {
  const token = await SecureStore.getItemAsync('jwt_access');
  if (!token) {
    const refreshToken = await SecureStore.getItemAsync('jwt_refresh');
    if (!refreshToken) return false;
    return true;
  }
  if (isTokenExpired(token)) {
    const refreshToken = await SecureStore.getItemAsync('jwt_refresh');
    if (!refreshToken) {
      await clearAuth();
      return false;
    }
    return true;
  }
  return true;
};

export const clearAuth = async () => {
  await SecureStore.deleteItemAsync('jwt_access');
  await SecureStore.deleteItemAsync('jwt_refresh');
  useUserStore.getState().setUser(null);
  useUserStore.getState().setIsGuest(false);
};
