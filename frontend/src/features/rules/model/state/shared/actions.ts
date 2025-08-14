import type { BaseRuleState } from './types';
import { validateForm } from './validation';
import { createInitialState } from './initialState';

export const createCommonActions = (set: any, get: () => BaseRuleState) => ({
  resetForm: () => {
    set(createInitialState());
  },

  setValidationErrors: (errors: string[]) => {
    set({ validationErrors: errors });
  },

  validateForm: async () => {
    const state = get();
    const errors = validateForm(state);
    set({ validationErrors: errors });
    return errors.length === 0;
  },
});
