/* eslint-disable no-console */
import { ENV_CONFIG, isDevelopment } from '@/config/envConfig';

/**
 * A logger function that will only logs on development
 * @param args - The arguments to be logged
 */
export const logger = (...args: unknown[]) => {
  if (!isDevelopment) return;

  console.log(
    '%c ============== INFO LOG \n',
    'color: #22D3EE',
    `${typeof window !== 'undefined' && window?.location.pathname}\n`,
    ...args
  );
};
