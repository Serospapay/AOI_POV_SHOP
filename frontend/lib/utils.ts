/**
 * Утилітарні функції
 */

/**
 * Форматує ціну у гривнях
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(price);
}

/**
 * Форматує ємність батареї
 */
export function formatCapacity(capacity: number): string {
  if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(1)} Ач`;
  }
  return `${capacity} мАг`;
}

/**
 * Форматує потужність
 */
export function formatPower(power: number): string {
  return `${power} Вт`;
}

/**
 * Об'єднує класи CSS
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Форматує дату для відображення
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

