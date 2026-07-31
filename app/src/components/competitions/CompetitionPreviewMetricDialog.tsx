"use client";

import { METRICS, Metric, MetricProps, MetricType, isMetric } from "@wise-old-man/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "../Button";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
} from "../Combobox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";
import { MetricIconSmall } from "../Icon";
import { Label } from "../Label";
import { useCompetitionPageContext } from "./CompetitionPageContext";

const METRIC_TYPE_LABELS = {
  [MetricType.SKILL]: "Skills",
  [MetricType.BOSS]: "Bosses",
  [MetricType.ACTIVITY]: "Activities",
  [MetricType.COMPUTED]: "Computed",
};

export function CompetitionPreviewMetricDialog() {
  const { competition } = useCompetitionPageContext();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "preview";

  // Every metric in a competition is of the same type, so only metrics of that same type
  // (and that aren't already being tracked) can be previewed.
  const competitionMetrics = new Set(competition.metrics.map((m) => m.metric));
  const competitionMetricType = MetricProps[competition.metrics[0].metric].type;

  const previewableMetrics = METRICS.filter(
    (metric) => MetricProps[metric].type === competitionMetricType && !competitionMetrics.has(metric),
  );

  const [selectedMetric, setSelectedMetric] = useState<Metric | undefined>(previewableMetrics[0]);

  function handleSubmit() {
    if (!selectedMetric) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("preview", selectedMetric);
    nextParams.set("metric", selectedMetric);
    nextParams.delete("dialog");

    router.push(`${pathname}?${nextParams.toString()}`);
  }

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
      <DialogContent allowScroll>
        <DialogHeader>
          <DialogTitle>Preview another metric</DialogTitle>
          <DialogDescription>
            See who&apos;d be winning if this competition tracked a different metric. Previews are
            temporary and don&apos;t change the competition.
          </DialogDescription>
        </DialogHeader>
        <form
          className="mt-2 flex flex-col gap-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Label className="text-xs font-normal text-gray-200">Metric</Label>
          <MetricSelect
            metric={selectedMetric}
            metricType={competitionMetricType}
            options={previewableMetrics}
            onMetricSelected={setSelectedMetric}
          />
          <Button
            type="submit"
            size="lg"
            variant="blue"
            className="mt-4 justify-center"
            disabled={!selectedMetric}
          >
            Confirm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface MetricSelectProps {
  metric: Metric | undefined;
  metricType: MetricType;
  options: Array<Metric>;
  onMetricSelected: (metric: Metric | undefined) => void;
}

function MetricSelect(props: MetricSelectProps) {
  const { metric, metricType, options, onMetricSelected } = props;

  return (
    <Combobox
      value={metric}
      onValueChanged={(val) => {
        if (val === undefined) {
          onMetricSelected(undefined);
        } else if (isMetric(val)) {
          onMetricSelected(val);
        }
      }}
    >
      <ComboboxButton>
        <div className="flex items-center gap-x-2">
          {metric ? (
            <>
              <MetricIconSmall metric={metric} />
              <span className="line-clamp-1 text-left">{MetricProps[metric].name} </span>
            </>
          ) : (
            <span className="line-clamp-1 text-left text-gray-200">No metrics available</span>
          )}
        </div>
      </ComboboxButton>
      <ComboboxContent className="z-50">
        <ComboboxInput placeholder="Search metrics..." />
        <ComboboxEmpty>No results were found</ComboboxEmpty>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label={METRIC_TYPE_LABELS[metricType]}>
            {options.map((option) => (
              <ComboboxItem key={option} value={option}>
                <MetricIconSmall metric={option} />
                {MetricProps[option].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
