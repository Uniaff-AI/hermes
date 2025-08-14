import type { BaseRuleState } from '../shared/types';
import { formatDateToYYYYMMDD } from '../../../../../lib/utils';

export const createSendingSettingsHandlers = (
  set: any,
  get: () => BaseRuleState
) => ({
  handleDailyCapLimitChange: (value: string) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, dailyCapLimit: value },
      validationErrors: [],
    }));
  },

  handleMinIntervalMinutesChange: (value: string) => {
    set((state: BaseRuleState) => ({
      sendingSettings: {
        ...state.sendingSettings,
        minIntervalMinutes: value,
      },
      validationErrors: [],
    }));
  },

  handleMaxIntervalMinutesChange: (value: string) => {
    set((state: BaseRuleState) => ({
      sendingSettings: {
        ...state.sendingSettings,
        maxIntervalMinutes: value,
      },
      validationErrors: [],
    }));
  },

  handleIsInfiniteChange: (value: boolean) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, isInfinite: value },
      validationErrors: [],
    }));
  },

  handleIsActiveChange: (value: boolean) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, isActive: value },
      validationErrors: [],
    }));
  },

  handleSendWindowStartChange: (value: string) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, sendWindowStart: value },
      validationErrors: [],
    }));
  },

  handleSendWindowEndChange: (value: string) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, sendWindowEnd: value },
      validationErrors: [],
    }));
  },

  handleSendDateFromChange: (date: Date | null) => {
    set((state: BaseRuleState) => ({
      sendingSettings: {
        ...state.sendingSettings,
        sendDateFrom: date ? formatDateToYYYYMMDD(date) : '',
      },
      validationErrors: [],
    }));
  },

  handleSendDateToChange: (date: Date | null) => {
    set((state: BaseRuleState) => ({
      sendingSettings: {
        ...state.sendingSettings,
        sendDateTo: date ? formatDateToYYYYMMDD(date) : '',
      },
      validationErrors: [],
    }));
  },

  handleUseEmailChange: (value: boolean) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, useEmail: value },
      validationErrors: [],
    }));
  },

  handleUsePhoneChange: (value: boolean) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, usePhone: value },
      validationErrors: [],
    }));
  },

  handleUseRedirectChange: (value: boolean) => {
    set((state: BaseRuleState) => ({
      sendingSettings: { ...state.sendingSettings, useRedirect: value },
      validationErrors: [],
    }));
  },
});
