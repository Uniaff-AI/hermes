import * as React from 'react';

import '@/styles/globals.css'; // Import global styles
import { Providers } from './providers';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export const metadata = {
  title: 'Hermes CRM',
  description: 'Hermes CRM',
};

export default RootLayout;
