'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface CompactValidationResultProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  errors?: string[];
  onClose: () => void;
}

const CompactValidationResult: FC<CompactValidationResultProps> = ({
  isVisible,
  type,
  title,
  message,
  errors = [],
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          error: 'text-red-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          error: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          error: 'text-red-700',
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          className={`${colors.bg} ${colors.border} border rounded-md p-3 shadow-sm`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-xs font-medium ${colors.title}`}>
                  {title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <p className={`text-xs ${colors.message} mb-2`}>
                {message}
              </p>

              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.05 }}
                  className="space-y-0.5"
                >
                  <ul className="text-xs space-y-0.5">
                    {errors.slice(0, 3).map((error, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + index * 0.03 }}
                        className={`flex items-start gap-1.5 ${colors.error}`}
                      >
                        <span className="text-red-500 mt-0.5 text-xs">•</span>
                        <span className="leading-tight">{error}</span>
                      </motion.li>
                    ))}
                    {errors.length > 3 && (
                      <li className="text-xs text-gray-500 italic">
                        ... и еще {errors.length - 3} ошибок
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompactValidationResult;
