import * as React from 'react';

import '@/styles/globals.css'; // Import global styles
import { Providers } from './providers';

// Global error handler for SSR
if (typeof window === 'undefined') {
  // Prevent any filter operations during SSR
  const originalFilter = Array.prototype.filter;
  Array.prototype.filter = function (callback: any, thisArg?: any) {
    if (!this || !Array.isArray(this)) {
      console.warn('Attempted to call filter on non-array during SSR:', this);
      return [];
    }
    return originalFilter.call(this, callback, thisArg);
  };

  // Prevent Object.values errors during SSR
  const originalObjectValues = Object.values;
  Object.values = function (obj: any) {
    if (!obj || typeof obj !== 'object') {
      console.warn('Attempted to call Object.values on non-object during SSR:', obj);
      return [];
    }
    return originalObjectValues.call(this, obj);
  };
}

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
