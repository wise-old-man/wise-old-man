"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";

const TABS = [
  { label: "Current Top", route: "/leaderboards/top" },
  { label: "Records", route: "/leaderboards/records" },
  { label: "Efficiency", route: "/leaderboards/efficiency" },
];

export function LeaderboardsNavigation() {
  const pathname = usePathname();
  const selectedTab = TABS.find((t) => t.route.includes(pathname)) || TABS[0];

  return (
    <Tabs defaultValue={selectedTab.route}>
      <TabsList aria-label="Leaderboards Navigation">
        {TABS.map((tab) => (
          <Link href={tab.route} key={tab.route}>
            <TabsTrigger value={tab.route}>{tab.label}</TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  );
}
