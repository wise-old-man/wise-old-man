"use client";

import { useMemo, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  DeltaLeaderboardEntry,
  GroupDetails,
  Metric,
  MetricProps,
  PERIODS,
  Period,
  PeriodProps,
  SKILLS,
  isActivity,
  isBoss,
  isMetric,
  isPeriod,
  isSkill,
} from "@wise-old-man/utils";
import { TableTitle } from "../Table";
import { DataTable } from "../DataTable";
import { MetricIconSmall } from "../Icon";
import { PlayerIdentity } from "../PlayerIdentity";
import { FormattedNumber } from "../FormattedNumber";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
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

interface GroupGainedTableProps {
  metric: Metric;
  period: Period;
  group: GroupDetails;
  gains: DeltaLeaderboardEntry[];
}

export function GroupGainedTable(props: GroupGainedTableProps) {
  const { group, metric, period, gains } = props;

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

    router.replace(`/groups/${group.id}/gained?${nextParams.toString()}`);
  }

  function handlePeriodChanged(period: Period) {
    const nextParams = new URLSearchParams(searchParams);

    // Reset pagination if params change
    nextParams.delete("page");

    if (period) {
      nextParams.set("period", period);
    } else {
      nextParams.delete("period");
    }

    router.replace(`/groups/${group.id}/gained?${nextParams.toString()}`);
  }

  return (
    <DataTable
      columns={columnDefs}
      data={gains}
      enablePagination
      headerSlot={
        <TableTitle>
          <div>
            <h3 className="text-h3 font-medium text-white">Gained</h3>
            <p className="text-body text-gray-200">
              Most {MetricProps[metric].name} {MetricProps[metric].measure} gained in the past {period}
              &nbsp;
              {page > 1 ? `(page ${page})` : ""}
            </p>
          </div>
          <div className="flex items-center gap-x-3">
            <PeriodSelect period={period} onPeriodSelected={handlePeriodChanged} />
            <MetricSelect metric={metric} onMetricSelected={handleMetricChanged} />
          </div>
        </TableTitle>
      }
    />
  );
}

function getColumnDefinitions(page: number, metric: Metric) {
  const columns: ColumnDef<DeltaLeaderboardEntry>[] = [
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
    {
      accessorKey: "value",
      header: () => {
        if (isSkill(metric)) return "Experience";
        if (isBoss(metric)) return "Kills";
        if (isActivity(metric)) return "Score";
        return "Value";
      },
      cell: ({ row }) => {
        return <StartCell value={row.original.gained} metric={metric} />;
      },
    },
  ];

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
      <ComboboxButton isPending={isPending} className="min-w-[12rem]">
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

interface PeriodSelectProps {
  period: Period;
  onPeriodSelected: (period: Period) => void;
}

function PeriodSelect(props: PeriodSelectProps) {
  const { period, onPeriodSelected } = props;

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={period}
      onValueChanged={(val) => {
        startTransition(() => {
          if (val === undefined) {
            onPeriodSelected(Period.WEEK);
          } else if (isPeriod(val)) {
            onPeriodSelected(val);
          }
        });
      }}
    >
      <ComboboxButton className="w-full" isPending={isPending}>
        <div className="flex items-center gap-x-2">{PeriodProps[period].name}</div>
      </ComboboxButton>
      <ComboboxContent>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Period">
            {PERIODS.map((period) => (
              <ComboboxItem value={period} key={period}>
                {PeriodProps[period].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

function StartCell(props: { metric: Metric; value: number }) {
  const { metric, value } = props;

  if (isBoss(metric) && MetricProps[metric].minimumValue > value) {
    const { name, minimumValue } = MetricProps[metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} kills at {minimumValue} kc.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isActivity(metric) && MetricProps[metric].minimumValue > value) {
    const { name, minimumValue } = MetricProps[metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} after {minimumValue} score.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (value === -1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>This player is unranked in {MetricProps[metric].name}.</TooltipContent>
      </Tooltip>
    );
  }

  if (value === 0) {
    return <span>value</span>;
  }

  return (
    <span className="text-green-500">
      +<FormattedNumber value={value} />
    </span>
  );
}
