import { Injectable } from '@nestjs/common';

@Injectable()
export class RulesUtilsService {
  stringify(data: any): string {
    if (data == null) return '';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }

  sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  minTimeout(defaultTimeout?: number): number {
    // Increase the minimum timeout for complex requests to external APIs
    const minTime = 30000; // 30 seconds minimum
    const result = Math.max(defaultTimeout ?? 0, minTime);
    console.log(
      `Setting timeout: ${result}ms (default: ${defaultTimeout}, min: ${minTime})`,
    );
    return result;
  }

  getField(obj: any, ...keys: string[]): string | undefined {
    for (const k of keys) {
      const v = obj?.[k];
      if (v != null && String(v).trim() !== '') return String(v);
    }
    return undefined;
  }

  validateTimeWindow(start: string, end: string): boolean {
    const timeRegex = /^\d{2}:\d{2}$/;
    return timeRegex.test(start) && timeRegex.test(end);
  }

  parseTimeHM(timeStr: string): [number, number] {
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

  getTodayTimestamp(hours: number, minutes: number): number {
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    return today.getTime();
  }

  randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
