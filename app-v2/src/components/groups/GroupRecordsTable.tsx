"use client";

import { useMemo, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  GroupDetails,
  Metric,
  MetricProps,
  PERIODS,
  Period,
  PeriodProps,
  RecordLeaderboardEntry,
  SKILLS,
  isMetric,
  isPeriod,
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
import { LocalDate } from "../LocalDate";

interface GroupRecordsTableProps {
  metric: Metric;
  period: Period;
  group: GroupDetails;
  records: RecordLeaderboardEntry[];
}

export function GroupRecordsTable(props: GroupRecordsTableProps) {
  const { group, metric, period, records } = props;

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

    router.replace(`/groups/${group.id}/records?${nextParams.toString()}`, { scroll: false });
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

    router.replace(`/groups/${group.id}/records?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <DataTable
      columns={columnDefs}
      data={records}
      enablePagination
      headerSlot={
        <TableTitle>
          <div>
            <h3 className="text-h3 font-medium text-white">Records</h3>
            <p className="text-body text-gray-200">
              All-time most {MetricProps[metric].name} {MetricProps[metric].measure} gained in a{" "}
              {PeriodProps[period].name.toLowerCase()} period &nbsp;
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
  const columns: ColumnDef<RecordLeaderboardEntry>[] = [
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
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return (
          <div className="inline-block min-w-[9rem]">
            <LocalDate isoDate={row.original.updatedAt.toISOString()} />
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: "Gained",
      cell: ({ row }) => {
        if (row.original.value <= 0) return row.original.value;
        return <FormattedNumber value={row.original.value} colored />;
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
      <ComboboxButton className="w-32" isPending={isPending}>
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
