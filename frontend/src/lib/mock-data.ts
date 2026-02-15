/**
 * Mock fintech data for the dashboard.
 * These mirror the data shapes returned by the Python agent backend.
 */

export interface DailyVolume {
  date: string;
  transactions: number;
  amountUsd: number;
  successRate: number;
}

export interface KpiData {
  transactionVolume: { current: number; previous: number; trend: number };
  successRate: { current: number; previous: number; trend: number };
  avgLatency: { current: number; previous: number; trend: number };
}

export interface CategoryBreakdown {
  category: string;
  volume: number;
  amount: number;
}

export function getDailyVolumes(): DailyVolume[] {
  const now = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    const base = 35000 + Math.floor(Math.random() * 8000);
    return {
      date: date.toISOString().split("T")[0],
      transactions: base + (i > 20 ? Math.floor(i * 200) : 0),
      amountUsd: (base * 52.3) + Math.random() * 100000,
      successRate: 97.5 + Math.random() * 2.3,
    };
  });
}

export function getKpiData(): KpiData {
  return {
    transactionVolume: { current: 1_247_893, previous: 1_189_234, trend: 4.93 },
    successRate: { current: 99.12, previous: 98.87, trend: 0.25 },
    avgLatency: { current: 187, previous: 203, trend: -7.88 },
  };
}

export function getCategoryBreakdown(): CategoryBreakdown[] {
  return [
    { category: "E-Commerce", volume: 423_891, amount: 28_450_000 },
    { category: "Subscription", volume: 312_456, amount: 15_230_000 },
    { category: "POS / In-Store", volume: 198_234, amount: 12_870_000 },
    { category: "Invoice / B2B", volume: 156_789, amount: 45_600_000 },
    { category: "Marketplace", volume: 98_123, amount: 8_920_000 },
    { category: "Digital Goods", volume: 58_400, amount: 3_210_000 },
  ];
}

export interface TenantInfo {
  tenantId: string;
  name: string;
  plan: string;
  region: string;
}

export function getTenantInfo(): TenantInfo {
  return {
    tenantId: "tenant-demo-001",
    name: "Acme Payments Inc.",
    plan: "Enterprise",
    region: "US-East",
  };
}
