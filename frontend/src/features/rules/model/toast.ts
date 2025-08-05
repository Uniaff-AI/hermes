import { toast } from 'sonner';

export const rulesToast = {
  create: {
    success: (ruleName: string) => {
      toast.success('Правило создано', {
        description: `Правило "${ruleName}" успешно создано и добавлено в систему`,
        duration: 4000,
      });
    },
    error: (error?: string) => {
      toast.error('Ошибка создания правила', {
        description:
          error ||
          'Не удалось создать правило. Проверьте данные и попробуйте еще раз.',
        duration: 5000,
      });
    },
  },

  update: {
    success: (ruleName: string) => {
      toast.success('Правило обновлено', {
        description: `Правило "${ruleName}" успешно обновлено`,
        duration: 4000,
      });
    },
    error: (error?: string) => {
      toast.error('Ошибка обновления правила', {
        description:
          error ||
          'Не удалось обновить правило. Проверьте данные и попробуйте еще раз.',
        duration: 5000,
      });
    },
  },

  delete: {
    success: (ruleName: string) => {
      toast.success('Правило удалено', {
        description: `Правило "${ruleName}" успешно удалено из системы`,
        duration: 4000,
      });
    },
    error: (error?: string) => {
      toast.error('Ошибка удаления правила', {
        description: error || 'Не удалось удалить правило. Попробуйте еще раз.',
        duration: 5000,
      });
    },
  },

  loading: {
    rules: () => {
      toast.loading('Загрузка правил...', {
        duration: 2000,
      });
    },
    analytics: () => {
      toast.loading('Загрузка аналитики...', {
        duration: 2000,
      });
    },
  },

  general: {
    networkError: () => {
      toast.error('Ошибка сети', {
        description: 'Проверьте подключение к интернету и попробуйте еще раз.',
        duration: 5000,
      });
    },
    validationError: (field?: string) => {
      toast.error('Ошибка валидации', {
        description: field
          ? `Проверьте поле "${field}" и попробуйте еще раз.`
          : 'Проверьте введенные данные и попробуйте еще раз.',
        duration: 5000,
      });
    },
  },
};
