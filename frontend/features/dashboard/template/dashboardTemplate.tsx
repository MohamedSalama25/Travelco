"use client"

import React from 'react'
import LatestTransfersTable from '../components/LatestTransfersTable'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useTranslations } from 'next-intl'
import { FullScreenLoader } from '@/components/globalComponents/FullScreenLoader'
import Error from '@/components/globalComponents/Error'

export default function DashboardTemplate() {
  const t = useTranslations('dashboard');
  const { data: response, isLoading, isError } = useDashboardStats();

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <Error message={t("loadError") || "Error loading dashboard"} />;

  const { data } = response || {};

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive
              data={data?.dailyStats}
              title={t("ticketTrends") || "Ticket Trends"}
              description={t("monthlyTickets") || "Total tickets issued per month"}
            />
          </div>
          <div className="px-4 lg:px-6">
            <LatestTransfersTable data={data?.latestTransfers || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
