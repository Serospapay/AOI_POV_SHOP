/**
 * Утиліти для роботи з JWT токенами
 */

export interface DecodedToken {
  sub: string;
  email: string;
  is_admin: boolean;
  exp: number;
  type: string;
}

/**
 * Декодує JWT токен (без перевірки підпису, тільки для отримання даних)
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Помилка декодування токена:', error);
    return null;
  }
}

/**
 * Перевіряє чи токен не прострочений
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() >= decoded.exp * 1000;
}

