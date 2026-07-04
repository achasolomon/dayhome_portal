export function formatDate(date: Date | string | number, locale = 'en-CA'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: Date | string | number, locale = 'en-CA'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: Date | string | number, locale = 'en-CA'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function isExpired(date: Date | string | number): boolean {
  return new Date(date) < new Date();
}

export function daysUntil(date: Date | string | number): number {
  const target = new Date(date);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(date: Date | string | number, thresholdDays = 30): boolean {
  const remaining = daysUntil(date);
  return remaining >= 0 && remaining <= thresholdDays;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getAge(birthDate: Date): { years: number; months: number } {
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months };
}
