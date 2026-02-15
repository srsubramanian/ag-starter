"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  Settings,
  BarChart3,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agent", href: "/dashboard/agent", icon: Bot },
  { label: "Transactions", href: "#", icon: CreditCard, disabled: true },
  { label: "Analytics", href: "#", icon: BarChart3, disabled: true },
  { label: "Settings", href: "#", icon: Settings, disabled: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          AG
        </div>
        <span className="text-lg font-semibold">ag-starter</span>
      </div>

      <Separator />

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "pointer-events-none opacity-40"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.disabled && (
                <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Tenant info */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">AP</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Acme Payments</span>
          <span className="text-xs text-muted-foreground">Enterprise</span>
        </div>
      </div>
    </aside>
  );
}
