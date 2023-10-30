import { PropsWithChildren } from "react";
import { Label } from "~/components/Label";
import { getGroupStatistics } from "~/services/wiseoldman";
import { GroupStatisticsNavigation } from "~/components/groups/GroupStatisticsNavigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function GroupStatisticsLayout(props: PropsWithChildren<PageProps>) {
  const { id } = props.params;

  const statistics = await getGroupStatistics(id);

  return (
    <div className="grid grid-cols-12 gap-x-4">
      <div className="col-span-12 flex gap-3 md:col-span-3 md:flex-col">
        <Stat label="# Maxed Overall" value={String(statistics.maxedTotalCount)} />
        <Stat label="# Maxed Combat" value={String(statistics.maxedCombatCount)} />
        <Stat label="# 200m skills" value={String(statistics.maxed200msCount)} />
      </div>
      <div className="col-span-12 mt-7 md:col-span-9 md:mt-0">
        <GroupStatisticsNavigation id={id} />
        <div className="mt-5">{props.children}</div>
      </div>
    </div>
  );
}

function Stat(props: { label: string; value: string }) {
  const { label, value } = props;

  return (
    <div className="group flex h-[5rem] w-full flex-col items-start justify-center gap-y-2 rounded-lg border border-gray-500 bg-gray-800 px-6 shadow-sm">
      <div className="flex items-center gap-x-1">
        <Label className="text-xs text-gray-200">{label}</Label>
      </div>
      <div className="flex items-end gap-x-2">
        <span className="line-clamp-1 text-lg leading-5 text-white">{value}</span>
      </div>
    </div>
  );
}
