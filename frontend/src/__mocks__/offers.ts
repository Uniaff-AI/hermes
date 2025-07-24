export type Offer = {
  id: number;
  title: string;
  group: string;
  clicks: number;
  leads: number;
  sales: number;
  cr: string;
  epc: string;
  status: string;
};

export type OffersTableProps = {
  searchQuery: string;
};

export const mockOffers: Offer[] = [
  {
    id: 4481,
    title: '[SPACE-16] (LR-GOVP)',
    group: 'IN Proman HP',
    clicks: 0,
    leads: 0,
    sales: 0,
    cr: '0.00%',
    epc: '0.0000 $',
    status: 'Активный',
  },
  {
    id: 4492,
    title: '[CRYPTO-21] (NL-BITCOIN)',
    group: 'NL Finance Beta',
    clicks: 24,
    leads: 2,
    sales: 1,
    cr: '8.33%',
    epc: '0.1300 $',
    status: 'Отключен',
  },
  {
    id: 4505,
    title: '[HEALTH-02] (DE-VITA)',
    group: 'DE Health Main',
    clicks: 76,
    leads: 5,
    sales: 3,
    cr: '6.58%',
    epc: '0.2200 $',
    status: 'Активный',
  },
  {
    id: 4513,
    title: '[GAMBLE-11] (BR-CASINO)',
    group: 'BR Gaming Core',
    clicks: 15,
    leads: 1,
    sales: 0,
    cr: '6.67%',
    epc: '0.0500 $',
    status: 'Модерация',
  },
  {
    id: 4527,
    title: '[SOFT-08] (US-WINDOWS)',
    group: 'US Software A/B',
    clicks: 105,
    leads: 12,
    sales: 7,
    cr: '11.43%',
    epc: '0.3500 $',
    status: 'Активный',
  },
];
