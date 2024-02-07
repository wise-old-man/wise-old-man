import Link from "next/link";
import {
  METRICS,
  Metric,
  MetricProps,
  MetricType,
  PERIODS,
  Period,
  PeriodProps,
  Record,
  isComputedMetric,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { formatDatetime } from "~/utils/dates";
import { getPlayerDetails, getPlayerRecords } from "~/services/wiseoldman";
import { MetricIcon } from "~/components/Icon";
import { LocalDate } from "~/components/LocalDate";
import { QueryLink } from "~/components/QueryLink";
import { FormattedNumber } from "~/components/FormattedNumber";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    view?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await getPlayerDetails(decodeURI(props.params.username));

  return {
    title: `Records: ${player.displayName}`,
  };
}

export default async function PlayerRecordsPage(props: PageProps) {
  const { params, searchParams } = props;

  const username = decodeURI(params.username);
  const metricType = convertMetricType(searchParams.view);

  const [player, records] = await Promise.all([getPlayerDetails(username), getPlayerRecords(username)]);

  if (!records || records.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-200">
        {player.displayName} has no records.
      </div>
    );
  }

  const filteredRecords = records.filter((r) => {
    return (
      MetricProps[r.metric].type === metricType ||
      (metricType === MetricType.SKILL && r.metric === Metric.EHP) ||
      (metricType === MetricType.BOSS && r.metric === Metric.EHB)
    );
  });

  const aggregated = aggregateRecordsPerMetric(filteredRecords);

  return (
    <>
      <ToggleTabs value={metricType}>
        <ToggleTabsList>
          <QueryLink className="border-r border-gray-400" query={{ view: null }} shallow={false}>
            <ToggleTabsTrigger value={MetricType.SKILL}>Skills</ToggleTabsTrigger>
          </QueryLink>
          <QueryLink className="border-r border-gray-400" query={{ view: "bosses" }} shallow={false}>
            <ToggleTabsTrigger value={MetricType.BOSS}>Bosses</ToggleTabsTrigger>
          </QueryLink>
          <QueryLink query={{ view: "activities" }} shallow={false}>
            <ToggleTabsTrigger value={MetricType.ACTIVITY}>Activities</ToggleTabsTrigger>
          </QueryLink>
        </ToggleTabsList>
      </ToggleTabs>
      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {Array.from(aggregated.keys())
          .sort((a, b) => {
            return isComputedMetric(b) ? 1 : METRICS.indexOf(a) - METRICS.indexOf(b);
          })
          .map((key) => {
            const records = aggregated.get(key);
            if (!records) return null;
            return <MetricRecords key={key} metric={key} records={records} username={username} />;
          })}
      </div>
    </>
  );
}

interface MetricRecordsProps {
  metric: Metric;
  records: Record[];
  username: string;
}

function MetricRecords(props: MetricRecordsProps) {
  const { metric, records, username } = props;

  const map = new Map<Period, Record>();

  records.forEach((record) => {
    const values = map.get(record.period);
    if (!values) map.set(record.period, record);
  });

  return (
    <div>
      <div className="mb-5 flex items-center gap-x-3">
        <MetricIcon metric={metric} />
        <h3 className="text-base font-medium">{MetricProps[metric].name}</h3>
      </div>
      <div className="flex flex-col gap-y-2">
        {PERIODS.map((period) => {
          const record = map.get(period);

          if (!record) {
            return (
              <div
                key={`${metric}_${period}`}
                className="flex items-center justify-between rounded-lg border border-dashed border-gray-400 px-5 py-3 shadow-sm"
              >
                <span className="text-sm text-gray-200">{PeriodProps[period].name}</span>
                <div className="flex flex-col items-end text-gray-200">
                  <span className="mb-1 text-sm">N/A</span>
                  <span className="text-xs">Not set</span>
                </div>
              </div>
            );
          }

          const startDate = new Date(record.updatedAt.getTime() - PeriodProps[period].milliseconds);

          const params = new URLSearchParams({
            metric,
            startDate: startDate.toISOString(),
            endDate: record.updatedAt.toISOString(),
          });

          return (
            <Link
              prefetch={false}
              key={`${metric}_${period}`}
              href={`/players/${username}/gained?${params.toString()}`}
              className="group flex items-center justify-between rounded-lg border border-gray-500 bg-gray-800 px-5 py-3 shadow-sm"
            >
              <span className="text-sm font-medium text-white group-hover:underline">
                {PeriodProps[period].name}
              </span>
              <div className="flex flex-col items-end">
                <span className="mb-1 text-sm">
                  <FormattedNumber value={record.value} colored />
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-gray-200">
                      <LocalDate mode="date" isoDate={record.updatedAt.toISOString()} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{formatDatetime(record.updatedAt)}</TooltipContent>
                </Tooltip>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function convertMetricType(metricType?: string) {
  if (metricType === "activities") return MetricType.ACTIVITY;
  if (metricType === "bosses") return MetricType.BOSS;
  return MetricType.SKILL;
}

function aggregateRecordsPerMetric(records: Record[]) {
  const map = new Map<Metric, Record[]>();

  records.forEach((record) => {
    const values = map.get(record.metric);

    if (!values) {
      map.set(record.metric, [record]);
    } else {
      values.push(record);
    }
  });

  return map;
}
