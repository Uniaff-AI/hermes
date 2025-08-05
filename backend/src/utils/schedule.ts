/**
 * Парсит строку `"HH:MM"` в [hours, minutes].
 * Бросает ошибку, если формат неверный.
 */
export function parseTimeWindow(value: string): [number, number] {
    const matched = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!matched) {
        throw new Error(`Invalid time format, expected "HH:MM", got "${value}"`);
    }
    return [Number(matched[1]), Number(matched[2])];
}

/** Возвращает случайное целое в [min, max] */
export function randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}