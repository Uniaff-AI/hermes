/**
 * Парсит строку "HH:MM" и возвращает [час, минута].
 * Бросает Error, если формат неверный.
 */
export function parseTimeHM(value: string): [number, number] {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    throw new Error(`Invalid time format: "${value}". Expected "HH:MM".`);
  }
  return [Number(match[1]), Number(match[2])];
}

/**
 * Возвращает timestamp сегодня в указанное время.
 */
export function getTodayTimestamp(hour: number, minute: number): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}
