import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'helpdesk_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 (expired/invalid token) notify the app so it can log the user out
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

interface ApiErrorBody {
  message?: string;
  details?: { field: string; message: string }[];
}

/** Turns any error into a human-readable message */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.';
    const { message, details } = error.response.data ?? {};
    if (details?.length) return details.map((d) => d.message).join('. ');
    return message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
