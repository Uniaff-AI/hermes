'use client';

import { FC, useState, useEffect } from 'react';
import { X, Filter, Settings, MessageSquare, Shield, Mail, Phone, Loader2 } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Rule, UpdateRule } from '@/features/rules/model/schemas';
import { useUpdateRule } from '@/features/rules/model/hooks';

interface RuleEditModalProps {
  rule: Rule | null;
  isOpen: boolean;
  onClose: () => void;
}

const RuleEditModal: FC<RuleEditModalProps> = ({ rule, isOpen, onClose }) => {
  const [formData, setFormData] = useState<UpdateRule>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const updateRuleMutation = useUpdateRule();

  // Инициализация формы при открытии модала
  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        periodMinutes: rule.periodMinutes,
        minInterval: rule.minInterval,
        maxInterval: rule.maxInterval,
        dailyLimit: rule.dailyLimit,
        sendWindowStart: rule.sendWindowStart,
        sendWindowEnd: rule.sendWindowEnd,
        isActive: rule.isActive,
      });
    }
  }, [rule]);

  const handleInputChange = (field: keyof UpdateRule, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!rule) return;

    try {
      await updateRuleMutation.mutateAsync({ id: rule.id, data: formData });
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении правила:', error);
    }
  };

  const formatPeriod = (minutes: number) => {
    if (minutes >= 1440) {
      return '24 часа (1 день)';
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} ${hours === 1 ? 'час' : 'часов'}`;
    }
    return `${minutes} минут`;
  };

  const getPeriodValue = (minutes: number) => {
    if (minutes >= 1440) return '24';
    if (minutes >= 720) return '12';
    if (minutes >= 360) return '6';
    return '1';
  };

  if (!rule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="flex items-start justify-between pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Настройки правила: {rule.name}
          </DialogTitle>
          <div className="text-sm text-gray-600 mb-6">
            Изменение параметров правила редиректа
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Основные Настройки */}
          <section className="space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Filter className="w-5 h-5" />
              <span>Основные Настройки</span>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Название правила</Label>
                <Input
                  value={formData.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Введите название правила"
                />
              </div>
              <div>
                <Label>ID Оффера</Label>
                <Input
                  value={rule.offerId}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Название оффера</Label>
                <Input
                  value={rule.offerName}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>ПП (Партнёрская программа)</Label>
                <Input
                  value={rule.offerId ? `Партнерка для ${rule.offerId}` : ''}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Статус</Label>
                <Select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={value => handleInputChange('isActive', value === 'active')}
                  options={[
                    { label: 'Активно', value: 'active' },
                    { label: 'Неактивно', value: 'inactive' },
                  ]}
                />
              </div>
              <div>
                <Label>За какой период</Label>
                <Select
                  value={getPeriodValue(formData.periodMinutes || 1440)}
                  onChange={value => handleInputChange('periodMinutes', parseInt(value) * 60)}
                  options={[
                    { label: '1 час', value: '1' },
                    { label: '6 часов', value: '6' },
                    { label: '12 часов', value: '12' },
                    { label: '24 часа (1 день)', value: '24' },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Настройки Отправки */}
          <section className="pt-6 border-t border-gray-200 space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Settings className="w-5 h-5" />
              <span>Настройки Отправки</span>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>От (мин)</Label>
                  <Input
                    type="number"
                    value={formData.minInterval || 5}
                    onChange={e => handleInputChange('minInterval', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <Label>До (мин)</Label>
                  <Input
                    type="number"
                    value={formData.maxInterval || 15}
                    onChange={e => handleInputChange('maxInterval', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Система будет отправлять лиды в случайном интервале между указанными значениями
              </div>
              <div>
                <Label>Кап фильтр (лидов в день)</Label>
                <Input
                  type="number"
                  value={formData.dailyLimit || 100}
                  onChange={e => handleInputChange('dailyLimit', parseInt(e.target.value))}
                  min="1"
                  max="10000"
                />
              </div>
              <div>
                <Label>Начало периода отправки</Label>
                <Input
                  type="time"
                  value={formData.sendWindowStart || '09:00'}
                  onChange={e => handleInputChange('sendWindowStart', e.target.value)}
                />
              </div>
              <div>
                <Label>Конец периода отправки</Label>
                <Input
                  type="time"
                  value={formData.sendWindowEnd || '18:00'}
                  onChange={e => handleInputChange('sendWindowEnd', e.target.value)}
                />
              </div>
              <div className="lg:col-span-3">
                <Label>Методы отправки</Label>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <Checkbox defaultChecked />
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <Phone className="w-4 h-4" />
                    <span>Телефон</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Настройка сообщения */}
          <section className="pt-6 border-t border-gray-200 space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <MessageSquare className="w-5 h-5" />
              <span>Настройка сообщения</span>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Тип сообщения</Label>
                <Select
                  value="template"
                  onChange={() => { }}
                  options={[
                    { label: 'Из готовых шаблонов', value: 'template' },
                    { label: 'Кастомное сообщение', value: 'custom' },
                  ]}
                />
              </div>
              <div>
                <Label>Выберите шаблон</Label>
                <Select
                  placeholder="Выберите готовое сообщение"
                  value={selectedTemplate}
                  onChange={setSelectedTemplate}
                  options={[
                    { label: 'Welcome template', value: 'welcome' },
                    { label: 'Follow-up template', value: 'followup' },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Интеграция с Keitaro */}
          <section className="pt-6 border-t border-gray-200 space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Интеграция с Keitaro</span>
            </header>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-blue-700 mb-2">Учет основного трафика</div>
                  <p className="text-sm text-blue-900 mb-4">
                    Система автоматически учитывает объем основного трафика из Keitaro и догружает лиды в соответствии с установленными лимитами.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-blue-700">Группа офферов в Keitaro</Label>
                      <Select
                        placeholder="Выберите группу"
                        value=""
                        onChange={() => { }}
                        options={[
                          { label: 'Forex Group', value: 'forex' },
                          { label: 'Crypto Group', value: 'crypto' },
                        ]}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-blue-700">Текущий объем (сегодня)</Label>
                      <Input
                        value="47"
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateRuleMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {updateRuleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              'Сохранить изменения'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleEditModal;
