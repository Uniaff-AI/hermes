/**
 * Парсит строку "HH:MM" и возвращает [час, минута].
 * Бросает Error, если формат неверный.
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
 * Возвращает timestamp сегодня в указанное время.
 */
export function getTodayTimestamp(hours: number, minutes: number): number {
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today.getTime();
}
