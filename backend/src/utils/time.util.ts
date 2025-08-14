/**
 * Parses a string "HH:MM" and returns [hour, minute].
 * Throws an Error if the format is invalid.
 */
export function parseTimeHM(timeStr: string): [number, number] {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  return [hours, minutes];
}

/**
 * Returns the timestamp for today at the specified time.
 */
export function getTodayTimestamp(hours: number, minutes: number): number {
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today.getTime();
}

/**
 * Returns the current date in YYYY-MM-DD format in the server's local time.
 * Used to validate dates instead of UTC time.
 */
export function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
