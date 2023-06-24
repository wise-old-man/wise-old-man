import dynamic from "next/dynamic";
import { Metric, MetricProps, Period } from "@wise-old-man/utils";
import { fetchPlayerTimeline } from "~/services/wiseoldman";

const LineChartSSR = dynamic(() => import("../LineChart"), {
  ssr: false,
  loading: () => <PlayerTimelineChartSkeleton />,
});

interface PlayerTimelineChartProps {
  username: string;
  period: Period;
  metric: Metric;
}

export async function PlayerTimelineChart(props: PlayerTimelineChartProps) {
  const { username, period, metric } = props;

  const { name, measure } = MetricProps[metric];
  const timelineData = await fetchPlayerTimeline(username, period, metric);

  if (timelineData.length < 2 || timelineData.every((d) => d.value === -1)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        Not enough data
      </div>
    );
  }

  return (
    <LineChartSSR
      datasets={[
        {
          name: `${name} ${measure}`,
          data: timelineData.map((d) => ({ value: d.value, time: d.date.getTime() })),
        },
      ]}
    />
  );
}



export function PlayerTimelineChartSkeleton() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
