'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useState } from 'react';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (categoryName: string) => void;
}

export const CreateCategoryModal = ({
  open,
  onClose,
  onSubmit,
}: CreateCategoryModalProps): JSX.Element => {
  const [categoryName, setCategoryName] = useState<string>('');

  const handleSubmit = (): void => {
    if (categoryName.trim()) {
      onSubmit(categoryName.trim());
      setCategoryName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создание новой категории</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Создайте пользовательскую категорию для группировки сообщений
          </p>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Название категории</label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Введите название категории"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={!categoryName.trim()}>
              Создать категорию
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
