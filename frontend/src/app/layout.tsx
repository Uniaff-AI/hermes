import * as React from 'react';

import '@/styles/globals.css'; // Import global styles

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="ru">
        <body>
        {children}
        </body>
        </html>
    );
};

export const metadata = {
    title: 'MyApp',
    description: 'A starter for Next.js, Tailwind CSS, and TypeScript',
};

export default RootLayout;