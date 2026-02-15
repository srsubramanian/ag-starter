import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  );
}
