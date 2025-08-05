'use client';

import { FC } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

interface AlertDialogProps {
  title?: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const AlertDialog: FC<AlertDialogProps> = ({
  title = 'Внимание',
  message,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-lg text-center font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">{message}</p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDialog;
