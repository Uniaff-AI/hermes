'use client';

import { FC, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AffiliateCompatibilityWarningProps {
  vertical: string;
  country: string;
  selectedAffiliate: string;
}

const AffiliateCompatibilityWarning: FC<AffiliateCompatibilityWarningProps> = ({
  vertical,
  country,
  selectedAffiliate,
}) => {
  const [availableAffiliates, setAvailableAffiliates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vertical || !country || !selectedAffiliate) {
      return;
    }

    checkAffiliateCompatibility();
  }, [vertical, country, selectedAffiliate]);

  const checkAffiliateCompatibility = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('vertical', vertical);
      params.append('country', country);

      const response = await fetch(`/api/external/get_leads?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Не удалось проверить совместимость');
      }

      const data = await response.json();
      let leads: any[] = [];


      if (data.success && data.data && Array.isArray(data.data)) {
        leads = data.data;
      } else if (data.leads && Array.isArray(data.leads)) {
        leads = data.leads;
      } else if (Array.isArray(data)) {
        leads = data;
      }

      // Extract unique affiliates from leads
      const affiliates = new Set<string>();
      leads.forEach((lead: any) => {
        const aff = lead.aff || lead.affiliate;
        if (aff && typeof aff === 'string' && aff.trim()) {
          affiliates.add(aff.trim());
        }
      });

      const availableList = Array.from(affiliates).sort();
      setAvailableAffiliates(availableList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка проверки');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Проверяем совместимость affiliate...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  const isCompatible = availableAffiliates.includes(selectedAffiliate);

  if (isCompatible) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span>Affiliate совместим - найдены лиды с "{selectedAffiliate}"</span>
      </div>
    );
  }

  if (availableAffiliates.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-orange-600">
        <AlertTriangle className="w-4 h-4" />
        <span>Для комбинации {vertical} + {country} лиды не найдены</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span>
          Несовместимый affiliate! "{selectedAffiliate}" не найден для {vertical} + {country}
        </span>
      </div>
      <div className="text-xs text-gray-600">
        <strong>Доступные affiliate:</strong> {availableAffiliates.join(', ')}
      </div>
    </div>
  );
};

export default AffiliateCompatibilityWarning;
