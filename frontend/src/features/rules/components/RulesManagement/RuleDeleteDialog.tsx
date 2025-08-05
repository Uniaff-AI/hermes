'use client';

import { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

interface RuleDeleteDialogProps {
  ruleName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const RuleDeleteDialog: FC<RuleDeleteDialogProps> = ({
  ruleName,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg font-semibold text-center text-gray-900">
            Удалить правило
          </DialogTitle>
        </DialogHeader>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">
            Вы уверены, что хотите удалить правило <span className="font-medium text-gray-900">"{ruleName}"</span>?
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Это действие нельзя отменить.
            <br />
            Правило будет удалено навсегда.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleDeleteDialog;
