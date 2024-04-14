"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  Metric,
  MetricProps,
  SKILLS,
  isMetric,
} from "@wise-old-man/utils";
import { getMetricParam } from "~/utils/params";
import { Label } from "../Label";
import { Button } from "../Button";
import { MetricIconSmall } from "../Icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxSeparator,
} from "../Combobox";

interface PreviewMetricDialogProps {
  trueMetric: Metric;
}

export function PreviewMetricDialog(props: PreviewMetricDialogProps) {
  const { trueMetric } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "preview";
  const metric = getMetricParam(searchParams.get("preview")) || Metric.OVERALL;

  const [selectedMetric, setSelectedMetric] = useState<Metric>(metric);

  function handleReset() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("preview");
    nextParams.delete("dialog");

    router.push(`${pathname}?${nextParams.toString()}`);
  }

  function handleSubmit() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("preview", selectedMetric);
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
          <DialogTitle>Preview as another metric</DialogTitle>
          <DialogDescription>
            You can preview all calculations as if it were another metric, without the need to edit, or
            create new concurrent competitions.
          </DialogDescription>
        </DialogHeader>
        <form
          className="mt-2 flex flex-col gap-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Label className="text-xs font-normal text-gray-200">Preview metric</Label>
          <MetricSelect metric={selectedMetric} onMetricSelected={setSelectedMetric} />
          <Button type="submit" size="lg" variant="blue" className="mt-4 justify-center">
            Confirm
          </Button>
          <button type="button" className="text-medium mt-1 text-sm text-gray-200" onClick={handleReset}>
            Reset back to {MetricProps[trueMetric].name}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface MetricSelectProps {
  metric: Metric;
  onMetricSelected: (metric: Metric) => void;
}

function MetricSelect(props: MetricSelectProps) {
  const { metric, onMetricSelected } = props;

  return (
    <Combobox
      value={metric}
      onValueChanged={(val) => {
        if (val === undefined) {
          onMetricSelected(Metric.OVERALL);
        } else if (isMetric(val)) {
          onMetricSelected(val);
        }
      }}
    >
      <ComboboxButton>
        <div className="flex items-center gap-x-2">
          <MetricIconSmall metric={metric} />
          <span className="line-clamp-1 text-left">{MetricProps[metric].name} </span>
        </div>
      </ComboboxButton>
      <ComboboxContent className="z-50">
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
