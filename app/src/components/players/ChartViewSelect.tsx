"use client";

import { useTransition } from "react";
import { Metric, MetricProps } from "@wise-old-man/utils";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
} from "../Combobox";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { capitalize } from "~/utils/strings";

interface ChartViewSelectProps {
  metric: Metric;
}

export function ChartViewSelect(props: ChartViewSelectProps) {
  const { metric } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isTransitioning, startTransition] = useTransition();

  const view = searchParams.get("view") === "rank" ? "rank" : "value";

  function handleChartViewSelected(view: "value" | "rank") {
    const nextParams = new URLSearchParams(searchParams);
    if (view === "value") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", view);
    }

    const nextURL = `${pathname}?${nextParams.toString()}`;

    startTransition(() => {
      router.replace(nextURL, { scroll: false });
    });
  }

  return (
    <Combobox
      value={view}
      onValueChanged={(val) => {
        if (val === undefined) {
          handleChartViewSelected("value");
        } else if (val === "rank" || val === "value") {
          handleChartViewSelected(val);
        }
      }}
    >
      <ComboboxButton className="w-full" isPending={isTransitioning}>
        <div className="flex items-center gap-x-2">
          {view === "rank" ? "Ranks" : capitalize(MetricProps[metric].measure)}
        </div>
      </ComboboxButton>
      <ComboboxContent align="end">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            <ComboboxItem value="value">{capitalize(MetricProps[metric].measure)}</ComboboxItem>
            <ComboboxItem value="rank">Ranks</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
