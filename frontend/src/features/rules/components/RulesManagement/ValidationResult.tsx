'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ValidationResultProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  errors?: string[];
  onClose: () => void;
  compact?: boolean;
}

const ValidationResult: FC<ValidationResultProps> = ({
  isVisible,
  type,
  title,
  message,
  errors = [],
  onClose,
  compact = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
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
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className={`${colors.bg} ${colors.border} border rounded-lg p-4 shadow-sm`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium ${colors.title}`}>
                  {title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className={`text-sm ${colors.message} mb-3`}>
                {message}
              </p>

              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.1 }}
                  className="space-y-1"
                >
                  <ul className="text-sm space-y-1">
                    {errors.map((error, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className={`flex items-start gap-2 ${colors.error}`}
                      >
                        <span className="text-red-500 mt-1">•</span>
                        <span className="leading-relaxed">{error}</span>
                      </motion.li>
                    ))}
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

export default ValidationResult;
