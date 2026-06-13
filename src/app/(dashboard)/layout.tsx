import { AppHeader } from "@/components/organismos/AppHeader";
import { Sidebar } from "@/components/organismos/Sidebar";
import { DashboardNavigationProvider } from "@/context/DashboardNavigationContext";
import { MobileNavProvider } from "@/context/MobileNavContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardNavigationProvider>
      <MobileNavProvider>
        <div className="app-shell">
          <Sidebar />
          <div className="app-main">
            <AppHeader />
            <main className="app-content">{children}</main>
          </div>
        </div>
      </MobileNavProvider>
    </DashboardNavigationProvider>
  );
}
