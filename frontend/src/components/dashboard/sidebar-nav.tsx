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
    <aside className="flex h-screen w-16 flex-col items-center border-r bg-card py-4">
      {/* Brand */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
        AG
      </div>

      {/* Nav links */}
      <nav className="mt-6 flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              title={item.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "pointer-events-none opacity-40"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      {/* Tenant avatar */}
      <Avatar className="h-8 w-8" title="Acme Payments">
        <AvatarFallback className="text-xs">AP</AvatarFallback>
      </Avatar>
    </aside>
  );
}
