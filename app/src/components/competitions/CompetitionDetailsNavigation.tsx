"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import { usePathname, useSearchParams } from "next/navigation";
import { CompetitionDetails, CompetitionType } from "@wise-old-man/utils";

interface CompetitionDetailsNavigationProps {
  competition: CompetitionDetails;
}

const TABS = [
  { label: "Overview", route: "/" },
  { label: "Participants", route: "/participants" },
  { label: "Top 5 chart", route: "/top-5" },
];

export function CompetitionDetailsNavigation(props: CompetitionDetailsNavigationProps) {
  const { competition } = props;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const previewMetric = searchParams.get("preview");
  const routeSegment = pathname.split("/").at(-1) || "";

  let selectedSegment: string;

  if (routeSegment === "top-5") {
    selectedSegment = "top-5";
  } else if (routeSegment === "participants" && competition.type === CompetitionType.TEAM) {
    selectedSegment = "participants";
  } else {
    selectedSegment = "overview";
  }

  const selectedTab = TABS.find((t) => t.route.includes(selectedSegment)) || TABS[0];

  return (
    <div className="custom-scroll pointer-events-auto relative mb-6 overflow-x-auto bg-gray-900 pb-2">
      <Tabs defaultValue={selectedTab.route}>
        <TabsList aria-label="Competition Details Navigation">
          {TABS.filter(
            (t) => t.route !== "/participants" || competition.type === CompetitionType.TEAM
          ).map((tab) => {
            let url = `/competitions/${competition.id}${tab.route}`;
            if (previewMetric) url += `?preview=${previewMetric}`;

            return (
              <Link href={url} key={tab.route}>
                <TabsTrigger value={tab.route}>{tab.label}</TabsTrigger>
              </Link>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
