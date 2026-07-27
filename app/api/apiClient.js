import { BASE_URL } from './apiConfig';
import * as SecureStore from 'expo-secure-store';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve(token);
    });
    failedQueue = [];
};

const refreshAccessToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('jwt_refresh');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
        await SecureStore.deleteItemAsync('jwt_access');
        await SecureStore.deleteItemAsync('jwt_refresh');
        throw new Error('Refresh token expired');
    }

    const data = await response.json();
    await SecureStore.setItemAsync('jwt_access', data.access);
    if (data.refresh) {
        await SecureStore.setItemAsync('jwt_refresh', data.refresh);
    }
    return data.access;
};

export const apiClient = async (url, options = {}) => {
    const token = await SecureStore.getItemAsync('jwt_access');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    };

    let response = await fetch(`${BASE_URL}${url}`, config);

    if (response.status === 401) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken) => {
                config.headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(`${BASE_URL}${url}`, config);
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            config.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(`${BASE_URL}${url}`, config);
        } catch (error) {
            processQueue(error, null);
            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};

export const apiClientAuth = async (url, options = {}) => {
    const token = await SecureStore.getItemAsync('jwt_access');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
    };

    let response = await fetch(`${BASE_URL}${url}`, config);

    if (response.status === 401) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken) => {
                config.headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(`${BASE_URL}${url}`, config);
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            config.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(`${BASE_URL}${url}`, config);
        } catch (error) {
            processQueue(error, null);
            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};

export const apiClientFormData = async (url, formData) => {
    const token = await SecureStore.getItemAsync('jwt_access');

    const config = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
    };

    let response = await fetch(`${BASE_URL}${url}`, config);

    if (response.status === 401) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken) => {
                config.headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(`${BASE_URL}${url}`, config);
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            config.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(`${BASE_URL}${url}`, config);
        } catch (error) {
            processQueue(error, null);
            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};
