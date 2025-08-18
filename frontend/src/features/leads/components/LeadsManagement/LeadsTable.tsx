import { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Trash2, Users } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { useLeads } from '../../model/hooks';
import { LeadsFilters } from '../../model/schemas';
import { StatusTranslations } from '@/shared/utilities/enums';
import { AnimatePresence, motion } from 'framer-motion';

interface LeadsTableProps {
  searchQuery: string;
  filters: LeadsFilters;
}

export const LeadsTable = ({ searchQuery, filters }: LeadsTableProps) => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Use server-side filtering for dropdown filters only, exclude search-related fields
  const serverFilters = useMemo(() => {
    const { productName: _, ...serverFilters } = filters;
    return serverFilters;
  }, [filters]);

  const { data: allLeads = [], isLoading, error } = useLeads(serverFilters);

  // Client-side filtering for search query and productName (as it was originally)
  const leads = useMemo(() => {
    if (!isClient || !Array.isArray(allLeads) || allLeads.length === 0) {
      return [];
    }

    let filtered = [...allLeads];

    // Client-side search across multiple fields
    if (searchQuery && searchQuery.trim() !== '') {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((lead) => {
        return (
          lead.leadName?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower) ||
          lead.productName?.toLowerCase().includes(searchLower) ||
          lead.vertical?.toLowerCase().includes(searchLower) ||
          lead.country?.toLowerCase().includes(searchLower) ||
          lead.status?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Client-side productName filtering
    if (filters.productName && filters.productName.trim() !== '') {
      const productNameLower = filters.productName.toLowerCase();
      filtered = filtered.filter((lead) => {
        return lead.productName?.toLowerCase().includes(productNameLower);
      });
    }

    return filtered;
  }, [isClient, allLeads, searchQuery, filters.productName]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasActiveFilters = () => {
    if (!filters || typeof filters !== 'object') return false;
    return Object.values(filters).some((value) => value !== undefined && value !== null && String(value).trim() !== '');
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked && Array.isArray(leads)) {
      setSelectedLeads(leads.map((lead) => lead.subid));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (
    leadId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedLeads((prev) => [...prev, leadId]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <Badge variant="secondary">Неизвестно</Badge>;
    }

    const translatedStatus = StatusTranslations[status];

    switch (status) {
      case 'New':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {translatedStatus || status}
          </Badge>
        );
      case 'Sale':
        return <Badge variant="success">{translatedStatus || status}</Badge>;
      case 'Reject':
        return <Badge variant="danger">{translatedStatus || status}</Badge>;
      case 'Trash':
        return <Badge variant="secondary">{translatedStatus || status}</Badge>;
      default:
        return <Badge variant="secondary">{translatedStatus || status}</Badge>;
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">Загрузка лидов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-red-500">
          Ошибка загрузки лидов:{' '}
          {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </div>
      </div>
    );
  }

  if (!Array.isArray(leads) || leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          {hasActiveFilters() || searchQuery?.trim()
            ? 'Лиды не найдены по вашему запросу.'
            : 'Лиды не найдены'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Selection Counter */}
      <AnimatePresence>
        {selectedLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Выбрано лидов: {selectedLeads.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Лиды</h2>
        <p className="text-sm text-gray-500">
          Показано {leads.length} лидов
          {selectedLeads.length > 0 && ` • Выбрано: ${selectedLeads.length}`}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={
                    selectedLeads.length === leads.length &&
                    leads.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Продукт
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Страна
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Вертикаль
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Аффилиат
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Телефон
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SubID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.subid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedLeads.includes(lead.subid)}
                      onChange={(e) => handleSelectLead(lead.subid, e)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.vertical || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800"
                    >
                      {lead.aff}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.leadName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.subid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center py-6 text-gray-500">
                  {hasActiveFilters() || searchQuery?.trim()
                    ? 'Лиды не найдены по вашему запросу.'
                    : 'Лиды не найдены.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;
