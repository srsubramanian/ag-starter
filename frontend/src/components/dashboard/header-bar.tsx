"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/agent": "FinOps Agent",
  "/dashboard/transactions": "Transactions",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

export function HeaderBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-card px-6">
      <h1 className="text-sm font-semibold">{title}</h1>
    </header>
  );
}
