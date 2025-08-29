/**
 * Parses a string "HH:MM" or "HH:MM:SS" and returns [hour, minute].
 * Throws an Error if the format is invalid.
 */
export function parseTimeHM(timeStr: string): [number, number] {
  // Handle both HH:MM and HH:MM:SS formats
  const timeParts = timeStr.split(':');
  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    timeParts.length < 2 ||
    timeParts.length > 3
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

/**
 * Compares two date strings in YYYY-MM-DD format
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDateStrings(date1: string, date2: string): number {
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

/**
 * Checks if a date string is in the past compared to current date
 */
export function isDateInPast(dateStr: string): boolean {
  const currentDate = getCurrentDateString();
  return compareDateStrings(dateStr, currentDate) < 0;
}

/**
 * Checks if a date string is in the future compared to current date
 */
export function isDateInFuture(dateStr: string): boolean {
  const currentDate = getCurrentDateString();
  return compareDateStrings(dateStr, currentDate) > 0;
}
