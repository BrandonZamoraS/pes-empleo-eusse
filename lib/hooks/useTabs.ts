"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TabId = "roles" | "companies" | "locations" | "positions";

export interface Tab {
  id: TabId;
  label: string;
}

export const TABS: Tab[] = [
  { id: "roles", label: "Roles y usuarios" },
  { id: "companies", label: "Compañías" },
  { id: "locations", label: "Ubicaciones" },
  { id: "positions", label: "Posiciones" },
];

function isValidTab(tab: string | null): tab is TabId {
  return Boolean(tab && TABS.some((t) => t.id === tab));
}

export interface UseTabsReturn {
  activeTab: TabId;
  handleTabChange: (tabId: TabId) => void;
}

export function useTabs(): UseTabsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getInitialTab = (): TabId => {
    const urlTab = searchParams.get("tab");
    return isValidTab(urlTab) ? urlTab : "roles";
  };

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (isValidTab(urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    activeTab,
    handleTabChange,
  };
}