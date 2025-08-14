'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { CheckCircle, XCircle, AlertCircle, X, Users, Phone, Globe, BarChart3, Tag, UserCheck } from 'lucide-react';

interface Lead {
  name: string;
  phone: string;
  country: string;
  status: string;
  vertical: string;
  affiliate: string;
}

interface LeadValidationResultProps {
  isVisible: boolean;
  result: 'idle' | 'success' | 'error' | 'no-leads';
  message: string;
  leadCount?: number;
  sampleLeads?: Lead[];
  onClose: () => void;
}

const LeadValidationResult: FC<LeadValidationResultProps> = ({
  isVisible,
  result,
  message,
  leadCount,
  sampleLeads = [],
  onClose,
}) => {
  const getIcon = () => {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'no-leads':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (result) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
        };
      case 'no-leads':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          title: 'text-gray-800',
          message: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800',
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
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-medium ${colors.title}`}>
                    {result === 'success' ? 'Лиды найдены' :
                      result === 'no-leads' ? 'Лиды не найдены' :
                        'Ошибка проверки'}
                  </h3>
                  {leadCount !== undefined && result === 'success' && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                      {leadCount} лидов
                    </span>
                  )}
                </div>
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

              {sampleLeads.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-medium text-green-800">
                    Примеры найденных лидов:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sampleLeads.map((lead, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="bg-white p-3 rounded border border-green-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <UserCheck className="w-3 h-3 text-green-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {lead.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{lead.phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span>{lead.country}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                <span>{lead.status}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                <span>{lead.vertical}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              <span>{lead.affiliate}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeadValidationResult;
