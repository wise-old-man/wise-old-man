"use client";

import { useMemo, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  GroupDetails,
  GroupHiscoresActivityItem,
  GroupHiscoresBossItem,
  GroupHiscoresComputedMetricItem,
  GroupHiscoresEntry,
  GroupHiscoresSkillItem,
  Metric,
  MetricProps,
  SKILLS,
  isActivity,
  isBoss,
  isComputedMetric,
  isMetric,
  isSkill,
} from "@wise-old-man/utils";
import { TableTitle } from "../Table";
import { DataTable } from "../DataTable";
import { MetricIconSmall } from "../Icon";
import { PlayerIdentity } from "../PlayerIdentity";
import { FormattedNumber } from "../FormattedNumber";
import { timeago } from "~/utils/dates";
import { getPageParam } from "~/utils/params";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxItemsContainer,
  ComboboxItemGroup,
  ComboboxItem,
  ComboboxSeparator,
} from "../Combobox";

interface GroupHiscoresTableProps {
  metric: Metric;
  group: GroupDetails;
  hiscores: GroupHiscoresEntry[];
}

export function GroupHiscoresTable(props: GroupHiscoresTableProps) {
  const { group, metric, hiscores } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const page = getPageParam(searchParams.get("page")) || 1;
  const columnDefs = useMemo(() => getColumnDefinitions(page, metric), [page, metric]);

  function handleMetricChanged(metric: Metric) {
    const nextParams = new URLSearchParams(searchParams);

    // Reset pagination if params change
    nextParams.delete("page");

    if (metric) {
      nextParams.set("metric", metric);
    } else {
      nextParams.delete("metric");
    }

    router.replace(`/groups/${group.id}/hiscores?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <DataTable
      columns={columnDefs}
      data={hiscores}
      enablePagination
      headerSlot={
        <TableTitle>
          <div>
            <h3 className="text-h3 font-medium text-white">Hiscores</h3>
            <p className="text-body text-gray-200">
              {MetricProps[metric].name} hiscores for {group.name} members{" "}
              {page > 1 ? `(page ${page})` : ""}
            </p>
          </div>
          <MetricSelect metric={metric} onMetricSelected={handleMetricChanged} />
        </TableTitle>
      }
    />
  );
}

function getColumnDefinitions(page: number, metric: Metric) {
  const columns: ColumnDef<GroupHiscoresEntry>[] = [
    {
      id: "rank",
      header: "Rank",
      accessorFn: (_, index) => {
        return index + 1 + (page - 1) * 20;
      },
    },
    {
      accessorKey: "player",
      header: "Player",
      cell: ({ row }) => {
        return (
          <div className="pr-5">
            <PlayerIdentity
              player={row.original.player}
              caption={
                row.original.player.updatedAt
                  ? `Updated ${timeago.format(row.original.player.updatedAt)}`
                  : undefined
              }
            />
          </div>
        );
      },
    },
  ];

  if (isSkill(metric)) {
    columns.push(
      {
        id: "experience",
        accessorFn: (row) => (row.data as GroupHiscoresSkillItem).experience,
        header: "Exp.",
        cell: ({ row }) => {
          return <FormattedNumber value={(row.original.data as GroupHiscoresSkillItem).experience} />;
        },
      },
      {
        id: "level",
        accessorFn: (row) => (row.data as GroupHiscoresSkillItem).level,
        header: "Level",
        cell: ({ row }) => (
          <FormattedNumber value={(row.original.data as GroupHiscoresSkillItem).level} />
        ),
      }
    );
  } else if (isBoss(metric)) {
    columns.push({
      id: "kills",
      accessorFn: (row) => (row.data as GroupHiscoresBossItem).kills,
      header: "Kills",
      cell: ({ row }) => {
        return <FormattedNumber value={(row.original.data as GroupHiscoresBossItem).kills} />;
      },
    });
  } else if (isActivity(metric)) {
    columns.push({
      id: "score",
      accessorFn: (row) => (row.data as GroupHiscoresActivityItem).score,
      header: "Score",
      cell: ({ row }) => {
        return <FormattedNumber value={(row.original.data as GroupHiscoresActivityItem).score} />;
      },
    });
  } else if (isComputedMetric(metric)) {
    columns.push({
      id: "value",
      accessorFn: (row) => (row.data as GroupHiscoresComputedMetricItem).value,
      header: "Value",
      cell: ({ row }) => {
        return Math.round((row.original.data as GroupHiscoresComputedMetricItem).value);
      },
    });
  }

  columns.push({
    id: "globalRank",
    accessorFn: (row) => row.data.rank,
    header: "Global Rank",
    cell: ({ row }) => {
      return <FormattedNumber value={row.original.data.rank} />;
    },
  });

  return columns;
}

interface MetricSelectProps {
  metric: Metric;
  onMetricSelected: (metric: Metric) => void;
}

function MetricSelect(props: MetricSelectProps) {
  const { metric, onMetricSelected } = props;

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={metric}
      onValueChanged={(val) => {
        startTransition(() => {
          if (val === undefined) {
            onMetricSelected(Metric.OVERALL);
          } else if (isMetric(val)) {
            onMetricSelected(val);
          }
        });
      }}
    >
      <ComboboxButton isPending={isPending} className="min-w-[3rem]">
        <div className="flex items-center gap-x-2">
          <MetricIconSmall metric={metric} />
          <span className="line-clamp-1 text-left">{MetricProps[metric].name} </span>
        </div>
      </ComboboxButton>
      <ComboboxContent className="max-h-[16rem]" align="end">
        <ComboboxInput placeholder="Search metrics..." />
        <ComboboxEmpty>No results were found</ComboboxEmpty>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Skills">
            {SKILLS.map((skill) => (
              <ComboboxItem key={skill} value={skill}>
                <MetricIconSmall metric={skill} />
                {MetricProps[skill].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
          <ComboboxSeparator />
          <ComboboxItemGroup label="Bosses">
            {BOSSES.map((boss) => (
              <ComboboxItem key={boss} value={boss}>
                <MetricIconSmall metric={boss} />
                {MetricProps[boss].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
          <ComboboxSeparator />
          <ComboboxItemGroup label="Activities">
            {ACTIVITIES.map((activity) => (
              <ComboboxItem key={activity} value={activity}>
                <MetricIconSmall metric={activity} />
                {MetricProps[activity].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
          <ComboboxItemGroup label="Computed">
            {COMPUTED_METRICS.map((computed) => (
              <ComboboxItem key={computed} value={computed}>
                <MetricIconSmall metric={computed} />
                {MetricProps[computed].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
