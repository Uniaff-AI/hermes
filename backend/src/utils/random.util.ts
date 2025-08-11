/**
 * Генерирует случайное число в диапазоне [min, max] включительно
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
