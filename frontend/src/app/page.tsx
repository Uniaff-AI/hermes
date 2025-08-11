'use client';

import Head from 'next/head';
import React from 'react';
import ErrorBoundary from '@/shared/providers/ErrorBoundary';

import Stats from '@/features/dashboard/Stats';
import Layout from '@/app/layout/Layout';

import DashboardPage from '@/app/dashboard/page';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Products Dashboard - Hermes</title>
      </Head>

      <ErrorBoundary>
        <Stats />
      </ErrorBoundary>

      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    </Layout>
  );
};

export default HomePage;
