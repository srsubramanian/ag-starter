import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { HeaderBar } from "@/components/dashboard/header-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <div className="flex flex-1 flex-col min-w-0">
        <HeaderBar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
