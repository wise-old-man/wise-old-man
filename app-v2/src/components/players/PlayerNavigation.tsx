"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import { usePathname } from "next/navigation";

interface PlayerNavigationProps {
  username: string;
}

const TABS = [
  { label: "Overview", route: "/" },
  { label: "Gained", route: "/gained" },
  { label: "Competitions", route: "/competitions" },
  { label: "Groups", route: "/groups" },
  { label: "Records", route: "/records" },
  { label: "Achievements", route: "/achievements" },
  { label: "Name Changes", route: "/name-changes" },
];

export function PlayerNavigation(props: PlayerNavigationProps) {
  const { username } = props;

  const pathname = usePathname();
  const selectedTab = TABS.find((t) => t.route.includes(pathname.split("/").at(-1) || "")) || TABS[0];

  return (
    <div className="custom-scroll pointer-events-auto relative mb-6 overflow-x-auto bg-gray-900 pb-2">
      <Tabs defaultValue={selectedTab.route}>
        <TabsList aria-label="Competition Navigation">
          {TABS.map((tab) => (
            <Link href={`/players/${username}${tab.route}`} key={tab.route}>
              <TabsTrigger value={tab.route}>{tab.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
