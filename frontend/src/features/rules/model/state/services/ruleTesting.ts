import type { BaseRuleState } from '../shared/types';
import { validateForm } from '../shared/validation';
import { initialRuleTest } from '../shared/initialState';

export const createRuleTestingService = (
  set: any,
  get: () => BaseRuleState
) => ({
  testRule: async () => {
    const state = get();

    set({
      ruleTest: {
        isTesting: true,
        result: 'idle',
        message: '',
        validationErrors: [],
      },
    });

    try {
      const errors = validateForm(state);

      if (errors.length > 0) {
        set({
          ruleTest: {
            isTesting: false,
            result: 'error',
            message: 'Обнаружены ошибки валидации',
            validationErrors: errors,
          },
        });
        return;
      }

      set({
        ruleTest: {
          isTesting: false,
          result: 'success',
          message: 'Правило прошло все проверки валидации! Можно создавать.',
          validationErrors: [],
        },
      });
    } catch (error) {
      set({
        ruleTest: {
          isTesting: false,
          result: 'error',
          message: 'Произошла ошибка при тестировании правила',
          validationErrors: [],
        },
      });
    }
  },

  resetRuleTest: () => {
    set({
      ruleTest: initialRuleTest,
    });
  },
});
