'use client';

import Head from 'next/head';
import React from 'react';

import Stats from "@/features/dashboard/Stats";
import Layout from '@/app/layout/Layout';

import DashboardPage from "@/app/dashboard/page";

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Offers Dashboard - Hermes</title>
      </Head>

      <Stats />
      <DashboardPage />
    </Layout>
  );
};

export default HomePage;
