"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import { AccountTypeSelector } from "./AccountTypeSelector";

const TABS = [
  { label: "EHP Rates", route: "/ehp" },
  { label: "EHB Rates", route: "/ehb" },
];

export function EfficiencyRatesNavigation() {
  const pathname = usePathname();
  const { type } = useParams();

  const selectedTab = TABS.find((t) => pathname.includes(t.route)) || TABS[0];

  return (
    <Tabs defaultValue={selectedTab.route}>
      <TabsList
        aria-label="Efficiency Rates Navigation"
        rightElementSlot={
          <div className="hidden sm:block">
            <AccountTypeSelector />
          </div>
        }
      >
        {TABS.map((tab) => (
          <Link prefetch={false} href={`${tab.route}/${type}`} key={tab.route}>
            <TabsTrigger value={tab.route}>{tab.label}</TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  );
}
