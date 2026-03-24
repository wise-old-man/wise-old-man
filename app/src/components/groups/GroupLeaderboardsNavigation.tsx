"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "../ToggleTabs";

export function GroupLeaderboardsNavigation() {
  const id = useParams().id;
  const selectedTab = usePathname().split("/").at(-1);

  return (
    <ToggleTabs value={selectedTab}>
      <ToggleTabsList className="divide-x divide-gray-500">
        <Link prefetch={false} href={`/groups/${id}/hiscores`} rel="nofollow">
          <ToggleTabsTrigger value="hiscores">Hiscores</ToggleTabsTrigger>
        </Link>
        <Link prefetch={false} href={`/groups/${id}/gained`} rel="nofollow">
          <ToggleTabsTrigger value="gained">Gained</ToggleTabsTrigger>
        </Link>
        <Link prefetch={false} href={`/groups/${id}/records`} rel="nofollow">
          <ToggleTabsTrigger value="records">Records</ToggleTabsTrigger>
        </Link>
      </ToggleTabsList>
    </ToggleTabs>
  );
}
