/**
 * API клієнт для взаємодії з backend
 */

import { API_BASE_URL } from './constants';

export interface ApiError {
  message: string;
  type?: string;
  detail?: string;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public data: ApiError
  ) {
    super(data.message || data.detail || 'API Error');
    this.name = 'ApiClientError';
  }
}

/**
 * Базовий fetch обгортка з обробкою помилок
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Визначаємо правильний базовий URL залежно від середовища
  const resolveApiBaseUrl = (): string => {
    // У браузері (клієнтська частина) ЗАВЖДИ використовуємо localhost
    // Браузер не може підключитися до Docker hostname 'backend'
    if (typeof window !== 'undefined') {
      return 'http://localhost:8000';
    }
    
    // На сервері (SSR) у Docker контейнері використовуємо Docker service name
    // Перевіряємо чи є змінна оточення, яка вказує на Docker network
    // Якщо NEXT_PUBLIC_API_URL містить 'backend:', використовуємо її
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      // Якщо env URL містить 'backend:', це Docker network - використовуємо як є
      if (envUrl.includes('backend:')) {
        return envUrl;
      }
      // Якщо env URL містить 'localhost', це для браузера - на SSR використовуємо backend:
      if (envUrl.includes('localhost')) {
        return 'http://backend:8000';
      }
      return envUrl;
    }
    
    // За замовчуванням для SSR у Docker використовуємо Docker service name
    return 'http://backend:8000';
  };

  const baseUrl = resolveApiBaseUrl();
  
  const url = `${baseUrl}${endpoint}`;
  
  // Логування тільки в режимі розробки
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${options.method || 'GET'} ${url}`, {
      isBrowser: typeof window !== 'undefined',
      baseUrl,
      endpoint,
    });
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Додаємо токен авторизації якщо є і він ще не доданий в headers
  if (!headers['Authorization'] && typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Створюємо AbortController для timeout (сумісність з усіма браузерами)
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timeoutId: NodeJS.Timeout | null = null;
  
  if (controller) {
    timeoutId = setTimeout(() => {
      controller!.abort();
    }, 30000); // 30 секунд timeout
  }
  
  const config: RequestInit = {
    ...options,
    headers,
    signal: controller?.signal || options.signal,
  };

  try {
    const response = await fetch(url, config);
    
    // Очищаємо timeout якщо запит успішний
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      throw new ApiClientError(response.status, errorData);
    }

    // Якщо response порожній (наприклад, 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // Очищаємо timeout при помилці
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Network error або інші помилки
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Network error';
    
    // Перевіряємо чи це помилка підключення
    if (
      errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('ERR_CONNECTION_REFUSED') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('AbortError') ||
      errorMessage.includes('timeout')
    ) {
      const isBrowser = typeof window !== 'undefined';
      const suggestedUrl = isBrowser ? 'http://localhost:8000' : 'http://backend:8000';
      
      throw new ApiClientError(0, {
        message: `Не вдалося підключитися до сервера. Перевірте, чи запущений бекенд на ${suggestedUrl}`,
        type: 'NetworkError',
        detail: `Використано URL: ${baseUrl}. ${isBrowser ? 'Браузер' : 'SSR'} запит. Можливі причини: бекенд не запущений, неправильний URL, або проблема з мережею.`,
      });
    }
    
    throw new ApiClientError(0, {
      message: errorMessage,
      type: 'UnknownError',
    });
  }
}

/**
 * GET запит
 */
export async function get<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'GET' });
}

/**
 * POST запит
 */
export async function post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Додаємо токен якщо передано, або беремо з localStorage
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return fetchApi<T>(endpoint, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT запит
 */
export async function put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Додаємо токен якщо передано, або беремо з localStorage
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE запит
 */
export async function del<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'DELETE' });
}

