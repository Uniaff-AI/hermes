export type Lead = {
  id: number;
  date: string;
  offer: string;
  clicks: number;
  group: string;
  country: string;
  partnerProgram: string;
  offerId: number;
  status: string;
  payment: string;
  name: string;
  phone: string;
  email: string;
  subId: string;
  clientTracker: string;
  companyName: string;
  lending: string;
};

export type LeadsTableProps = {
  searchQuery: string;
};

export const mockLeads: Lead[] = [
  {
    id: 1,
    date: '2025-07-03 00:24:07',
    offer: 'Sana Prosta',
    clicks: 100,
    group: '(P74) IN Proman HP',
    country: 'PE',
    partnerProgram: 'leadrock',
    offerId: 1,
    status: 'Лид',
    payment: '-',
    name: 'Sergio Marcelo Chamorro',
    phone: '+51965714281',
    email: 'marceloserg222@gmail.com',
    subId: '1bjk8163j1ts3',
    clientTracker: 'shark',
    companyName: '6661',
    lending: '4246',
  },
  {
    id: 2,
    date: '2025-07-03 00:24:22',
    offer: 'Pro Caps',
    clicks: 75,
    group: '(P74) IN Proman HP',
    country: 'TR',
    partnerProgram: 'monadlead',
    offerId: 430,
    status: 'Лид',
    payment: '-',
    name: 'Metin aksoy',
    phone: '+905317710424',
    email: '-',
    subId: '3m60dt83j1v85',
    clientTracker: 'shark',
    companyName: '7350',
    lending: '3230',
  },
  {
    id: 3,
    date: '2025-07-03 00:24:58',
    offer: 'Difort',
    clicks: 150,
    group: '(P74) IN Proman HP',
    country: 'GT',
    partnerProgram: 'everad',
    offerId: 1236658,
    status: 'Лид',
    payment: '-',
    name: 'America Rosa',
    phone: '+50231370503',
    email: '-',
    subId: '19vk611ta41sk',
    clientTracker: 'buran',
    companyName: '4363',
    lending: '2277',
  },
  {
    id: 4,
    date: '2025-07-03 00:25:08',
    offer: 'UROXEL LP',
    clicks: 50,
    group: '(P74) IN Proman HP',
    country: 'MX',
    partnerProgram: 'rocket',
    offerId: 554467,
    status: 'Продажа',
    payment: '27.00',
    name: 'Jose ANTONIO',
    phone: '+522221234567',
    email: 'dr.joseantonioadan@16.org',
    subId: 'nfg3j21pnd14',
    clientTracker: 'kit',
    companyName: '4379',
    lending: '6461',
  },
  {
    id: 5,
    date: '2025-07-03 00:25:15',
    offer: 'Sana Prosta',
    clicks: 100,
    group: '(P74) IN Proman HP',
    country: 'PE',
    partnerProgram: 'leadrock',
    offerId: 1,
    status: 'Лид',
    payment: '-',
    name: 'Maria Elena Rodriguez',
    phone: '+51987654321',
    email: 'maria.rodriguez@email.com',
    subId: 'abc123def456',
    clientTracker: 'shark',
    companyName: '6661',
    lending: '4246',
  },
];
