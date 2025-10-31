/**
 * Date utility functions with IST timezone support
 */

/**
 * Get current date and time in IST (Indian Standard Time)
 * IST is UTC+5:30
 */
export function getCurrentDateIST(): Date {
  // Get current UTC time
  const now = new Date();

  // IST is UTC + 5 hours 30 minutes
  const istOffset = 5.5 * 60 * 60 * 1000; // in milliseconds
  const utcTime = now.getTime();
  const istTime = new Date(utcTime + istOffset);

  return istTime;
}

/**
 * Calculate days between two dates
 * Returns negative if date2 is in the past, positive if in the future
 */
export function calculateDaysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate days from current IST date to target date
 * Returns negative if target is in the past (overdue), positive if in the future
 */
export function calculateDaysFromNowIST(targetDate: Date | string | null | undefined): number | null {
  if (!targetDate) return null;

  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const currentIST = getCurrentDateIST();

  return calculateDaysBetween(currentIST, target);
}

/**
 * Format a date to IST timezone string
 */
export function formatDateIST(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
