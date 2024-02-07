"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import { usePathname } from "next/navigation";

interface GroupDetailsNavigationProps {
  id: number;
}

const TABS = [
  { label: "Overview", route: "/" },
  { label: "Competitions", route: "/competitions" },
  { label: "Leaderboards", route: "/hiscores" },
  { label: "Achievements", route: "/achievements" },
  { label: "Name Changes", route: "/name-changes" },
  { label: "Statistics", route: "/statistics" },
];

export function GroupDetailsNavigation(props: GroupDetailsNavigationProps) {
  const { id } = props;

  const pathname = usePathname();
  const segment = pathname.split("/").at(-1) || "";

  let selectedTab;

  if (segment === "hiscores" || segment === "gained" || segment === "records") {
    selectedTab = TABS[2];
  } else {
    selectedTab = TABS.find((t) => t.route.includes(segment)) || TABS[0];
  }

  return (
    <div className="custom-scroll pointer-events-auto relative mb-6 overflow-x-auto bg-gray-900">
      <Tabs defaultValue={selectedTab.route}>
        <TabsList aria-label="Group Details Navigation">
          {TABS.map((tab) => (
            <Link prefetch={false} href={`/groups/${id}${tab.route}`} key={tab.route}>
              <TabsTrigger value={tab.route}>{tab.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
