import Link from "next/link";
import { PropsWithChildren } from "react";
import { Label } from "~/components/Label";
import { fetchGroupStatistics } from "~/services/wiseoldman";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function GroupStatisticsLayout(props: PropsWithChildren<PageProps>) {
  const { id } = props.params;

  // @ts-ignore - There's no decent API from Next.js yet (as of 13.4.0)
  const routeSegment = props.children.props.childProp.segment;

  const statistics = await fetchGroupStatistics(id);

  return (
    <div className="mt-7 grid grid-cols-12 gap-x-4">
      <div className="col-span-3 flex flex-col gap-y-3">
        <Stat label="# Maxed Overall" value={String(statistics.maxedTotalCount)} />
        <Stat label="# Maxed Combat" value={String(statistics.maxedCombatCount)} />
        <Stat label="# 200m skills" value={String(statistics.maxed200msCount)} />
      </div>
      <div className="col-span-9">
        <ToggleTabs defaultValue={routeSegment === "best" ? "best" : "statistics"}>
          <ToggleTabsList>
            <Link href={`/groups/${id}/statistics`} className="border-r border-gray-400">
              <ToggleTabsTrigger value="statistics">Average Stats</ToggleTabsTrigger>
            </Link>
            <Link href={`/groups/${id}/statistics/best`}>
              <ToggleTabsTrigger value="best">Best Players</ToggleTabsTrigger>
            </Link>
          </ToggleTabsList>
        </ToggleTabs>
        <div className="mt-5">{props.children}</div>
      </div>
    </div>
  );
}

function Stat(props: { label: string; value: string }) {
  const { label, value } = props;

  return (
    <div className="group flex h-[5rem] w-full flex-col items-start justify-center gap-y-2 rounded-lg border border-gray-600 px-6">
      <div className="flex items-center gap-x-1">
        <Label className="text-xs text-gray-200">{label}</Label>
      </div>
      <div className="flex items-end gap-x-2">
        <span className="line-clamp-1 text-lg leading-5 text-white">{value}</span>
      </div>
    </div>
  );
}
