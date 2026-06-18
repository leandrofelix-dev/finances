import { AppHeader } from "@/components/organismos/AppHeader";
import { AuthGuard } from "@/components/organismos/AuthGuard";
import { BottomDock } from "@/components/organismos/BottomDock";
import { Sidebar } from "@/components/organismos/Sidebar";
import { DashboardNavigationProvider } from "@/context/DashboardNavigationContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardNavigationProvider>
        <div className="app-shell">
          <Sidebar />
          <div className="app-main">
            <AppHeader />
            <main className="app-content">{children}</main>
          </div>
          <BottomDock />
        </div>
      </DashboardNavigationProvider>
    </AuthGuard>
  );
}
