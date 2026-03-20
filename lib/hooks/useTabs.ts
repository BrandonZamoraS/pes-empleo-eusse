"use client";

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
  const urlTab = searchParams.get("tab");
  const activeTab = isValidTab(urlTab) ? urlTab : "roles";

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    activeTab,
    handleTabChange,
  };
}
