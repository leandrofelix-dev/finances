"use client";

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import type { DashboardTab } from "@/lib/navigation";

export type SearchItem = {
  id: string;
  label: string;
  sublabel?: string;
  tab: DashboardTab;
  href: string;
};

type DashboardNavigationContextValue = {
  navigateToTab: (tab: DashboardTab) => void;
  setNavigateHandler: (handler: ((tab: DashboardTab) => void) | null) => void;
};

const DashboardNavigationContext = createContext<DashboardNavigationContextValue | null>(null);

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  const navigateHandlerRef = useRef<((tab: DashboardTab) => void) | null>(null);

  const setNavigateHandler = useCallback((handler: ((tab: DashboardTab) => void) | null) => {
    navigateHandlerRef.current = handler;
  }, []);

  const navigateToTab = useCallback((tab: DashboardTab) => {
    navigateHandlerRef.current?.(tab);
  }, []);

  const value = useMemo(
    () => ({ navigateToTab, setNavigateHandler }),
    [navigateToTab, setNavigateHandler]
  );

  return (
    <DashboardNavigationContext.Provider value={value}>{children}</DashboardNavigationContext.Provider>
  );
}

export function useDashboardNavigation() {
  return useContext(DashboardNavigationContext);
}
