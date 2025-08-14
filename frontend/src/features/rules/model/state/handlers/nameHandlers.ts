import type { BaseRuleState } from '../shared/types';

export const createNameHandlers = (set: any, get: () => BaseRuleState) => ({
  handleNameChange: (value: string) => {
    set({ name: value, validationErrors: [] });
  },
});
