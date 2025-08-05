/**
 * Возвращает случайное целое между min и max (включительно).
 * Если min > max — бросает Error.
 */
export function randomInRange(min: number, max: number): number {
  if (min > max) {
    throw new Error(`randomInRange: min (${min}) must be <= max (${max})`);
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
