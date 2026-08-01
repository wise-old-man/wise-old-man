"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricProps, formatNumber } from "@wise-old-man/utils";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWOMClient } from "~/hooks/useWOMClient";
import { convertToDiffTimeseries } from "~/utils/calcs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";
import { useCompetitionPageContext } from "./CompetitionPageContext";

const LineChartSSR = dynamic(() => import("../LineChart"), {
  ssr: false,
  loading: () => <ChartMessage>Loading...</ChartMessage>,
});

export function CompetitionTopHistoryChartDialog() {
  const { selectedMetric } = useCompetitionPageContext();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "history";

  function handleClose() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("dialog");

    router.replace(`${pathname}?${nextParams.toString()}`);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <DialogContent className="xs:max-w-[calc(100vw-2rem)] lg:max-w-5xl">
        <DialogHeader className="space-y-1">
          <DialogTitle>Top participant history</DialogTitle>
          <DialogDescription>
            {selectedMetric ? MetricProps[selectedMetric].name : "Total"} gained over time, by the
            competition&apos;s top participants.
          </DialogDescription>
        </DialogHeader>
        <Chart enabled={isOpen} />
      </DialogContent>
    </Dialog>
  );
}

function Chart({ enabled }: { enabled: boolean }) {
  const { competition, selectedMetric } = useCompetitionPageContext();

  const client = useWOMClient();

  const {
    data: topHistory,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["competition-top-history", competition.id, selectedMetric ?? "total", 5],
    queryFn: () => client.competitions.getCompetitionTopHistory(competition.id, selectedMetric, 5),
    staleTime: 60_000,
    enabled,
  });

  if (isPending) {
    return <div className="aspect-video w-full animate-pulse rounded-md bg-gray-700" />;
  }

  if (isError) {
    return <ChartMessage>Failed to load history</ChartMessage>;
  }

  const datasets = topHistory.map((p) => ({
    name: p.player.displayName,
    data: convertToDiffTimeseries(selectedMetric, p.history),
  }));

  if (!datasets.some((d) => d.data.length > 0)) {
    return <ChartMessage>No history yet</ChartMessage>;
  }

  return (
    <LineChartSSR
      datasets={datasets}
      showLegend
      tooltipValueFormatter={(value) => {
        if (value === 0) return "0";
        return `+${formatNumber(value, false)}`;
      }}
    />
  );
}

function ChartMessage(props: React.PropsWithChildren) {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      {props.children}
    </div>
  );
}
