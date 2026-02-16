"use client";

import { useMemo } from "react";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { getKpiData, getDailyVolumes, getCategoryBreakdown } from "@/lib/mock-data";

export default function DashboardPage() {
  const kpi = useMemo(() => getKpiData(), []);
  const dailyVolumes = useMemo(() => getDailyVolumes(), []);
  const categories = useMemo(() => getCategoryBreakdown(), []);

  return (
    <div className="overflow-y-auto h-full">
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of your payment operations
          </p>
        </div>
        <KpiCards kpi={kpi} dailyVolumes={dailyVolumes} />
        <CategoryChart data={categories} />
      </div>
    </div>
  );
}
