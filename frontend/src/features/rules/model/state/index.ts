export { useRuleCreationStore } from './creation';
export { useRuleEditStore } from './edit';

export type {
  BaseRuleState,
  BaseRuleActions,
  LeadFilters,
  TargetProduct,
  SendingSettings,
  LeadValidation,
  RuleTest,
  LeadFilterOptions,
  ProductOption,
} from './shared/types';

export {
  createInitialState,
  initialLeadFilters,
  initialTargetProduct,
  initialSendingSettings,
  initialLeadValidation,
  initialRuleTest,
  initialLeadFilterOptions,
} from './shared/initialState';

export {
  validateForm,
  validateName,
  validateTargetProduct,
  validateCountryMatch,
  validateSendingSettings,
  validateProductExists,
} from './shared/validation';

export { createNameHandlers } from './handlers/nameHandlers';
export { createLeadFilterHandlers } from './handlers/leadFilterHandlers';
export { createProductHandlers } from './handlers/productHandlers';
export { createSendingSettingsHandlers } from './handlers/sendingSettingsHandlers';

export { createInitializationService } from './services/initialization';
export { createLeadValidationService } from './services/leadValidation';
export { createRuleTestingService } from './services/ruleTesting';

export { createCommonActions } from './shared/actions';
