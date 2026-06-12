import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/organismos/AppHeader";
import { AppToaster } from "@/components/organismos/AppToast";
import { Sidebar } from "@/components/organismos/Sidebar";
import { DashboardNavigationProvider } from "@/context/DashboardNavigationContext";
import { MobileNavProvider } from "@/context/MobileNavContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finanças Pessoais",
  description: "Painel pessoal para controle financeiro e projeções.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <DashboardNavigationProvider>
          <MobileNavProvider>
            <div className="app-shell">
              <Sidebar />
              <div className="app-main">
                <AppHeader />
                <main className="app-content">{children}</main>
              </div>
            </div>
            <AppToaster />
          </MobileNavProvider>
        </DashboardNavigationProvider>
      </body>
    </html>
  );
}
