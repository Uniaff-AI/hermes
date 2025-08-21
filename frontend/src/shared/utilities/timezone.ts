/**
 * Timezone utility functions for converting between UTC and local time
 * Handles all time conversions for better UX while keeping backend in UTC
 */

/**
 * Convert local time (HH:MM) to UTC time string
 * @param localTime - Time in HH:MM format (user's local timezone)
 * @returns UTC time in HH:MM format
 */
export const convertLocalTimeToUTC = (localTime: string): string => {
  if (!localTime || !localTime.includes(':')) return localTime;

  const [hours, minutes] = localTime.split(':').map(Number);

  // Create a date object with today's date and the specified time
  const localDate = new Date();
  localDate.setHours(hours, minutes, 0, 0);

  // Get UTC time
  const utcHours = localDate.getUTCHours();
  const utcMinutes = localDate.getUTCMinutes();

  // Format as HH:MM
  return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
};

/**
 * Convert UTC time (HH:MM) to local time string
 * @param utcTime - Time in HH:MM format (UTC)
 * @returns Local time in HH:MM format
 */
export const convertUTCTimeToLocal = (utcTime: string): string => {
  if (!utcTime || !utcTime.includes(':')) return utcTime;

  const [hours, minutes] = utcTime.split(':').map(Number);

  // Create a date object with today's date and UTC time
  const utcDate = new Date();
  utcDate.setUTCHours(hours, minutes, 0, 0);

  // Get local time
  const localHours = utcDate.getHours();
  const localMinutes = utcDate.getMinutes();

  // Format as HH:MM
  return `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;
};

/**
 * Convert UTC datetime string to local datetime for display
 * @param utcDateTime - UTC datetime string (ISO format)
 * @returns Formatted local datetime string
 */
export const convertUTCToLocalDateTime = (utcDateTime: string): string => {
  if (!utcDateTime) return '';

  const date = new Date(utcDateTime);

  // Format as local datetime with timezone
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
};

/**
 * Convert UTC datetime to just local time (HH:MM) for display
 * @param utcDateTime - UTC datetime string (ISO format)
 * @returns Local time in HH:MM format
 */
export const convertUTCToLocalTime = (utcDateTime: string): string => {
  if (!utcDateTime) return '';

  const date = new Date(utcDateTime);

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Get current timezone information
 * @returns Object with timezone info
 */
export const getTimezoneInfo = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(offset / 60);
  const offsetSign = offset > 0 ? '-' : '+';

  return {
    timezone,
    offsetMinutes: offset,
    offsetString: `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}`,
    displayName: new Date()
      .toLocaleDateString(undefined, { timeZoneName: 'long' })
      .split(', ')[1],
  };
};

/**
 * Format time window for display (converts UTC to local)
 * @param startTime - UTC start time (HH:MM)
 * @param endTime - UTC end time (HH:MM)
 * @returns Formatted time window string
 */
export const formatTimeWindow = (
  startTime?: string,
  endTime?: string
): string => {
  if (!startTime || !endTime) return 'No time window set';

  const localStart = convertUTCTimeToLocal(startTime);
  const localEnd = convertUTCTimeToLocal(endTime);
  const timezoneInfo = getTimezoneInfo();

  return `${localStart} - ${localEnd} (${timezoneInfo.offsetString})`;
};

/**
 * Calculate minutes until next schedule time
 * @param scheduleTime - UTC datetime string
 * @returns Minutes until schedule time
 */
export const getMinutesUntilSchedule = (scheduleTime: string): number => {
  if (!scheduleTime) return 0;

  const now = new Date();
  const schedule = new Date(scheduleTime);
  const diff = schedule.getTime() - now.getTime();

  return Math.max(0, Math.round(diff / (1000 * 60)));
};

/**
 * Check if current time is within the specified UTC time window
 * @param startTime - UTC start time (HH:MM)
 * @param endTime - UTC end time (HH:MM)
 * @returns Boolean indicating if current time is in window
 */
export const isCurrentTimeInWindow = (
  startTime: string,
  endTime: string
): boolean => {
  if (!startTime || !endTime) return false;

  const now = new Date();
  const currentUTCTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const [currentHour, currentMinute] = currentUTCTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const currentMinutes = currentHour * 60 + currentMinute;

  // Handle window crossing midnight
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};
