"use client";

import { useSearchParams } from "next/navigation";
import { Metric, MetricProps, isMetric } from "@wise-old-man/utils";
import { Button } from "../Button";
import { QueryLink } from "../QueryLink";
import { MetricIconSmall } from "../Icon";
import { Alert, AlertTitle, AlertDescription } from "../Alert";

interface CompetitionPreviewWarningProps {
  trueMetric: Metric;
}

export function CompetitionPreviewWarning(props: CompetitionPreviewWarningProps) {
  const { trueMetric } = props;

  const searchParams = useSearchParams();
  const preview = searchParams.get("preview");

  if (!preview || !isMetric(preview)) return null;

  return (
    <Alert className="mb-7 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
      <div>
        <AlertTitle>
          <div className="mr-1">
            <MetricIconSmall metric={preview} />
          </div>
          Previewing as {MetricProps[preview].name}
        </AlertTitle>
        <AlertDescription>
          Although this is a {MetricProps[trueMetric].name} competition, you are currently previewing all
          calculations as if it were a {MetricProps[preview].name} competition.
        </AlertDescription>
      </div>
      <div className="whitespace-nowrap">
        <QueryLink query={{ dialog: "preview" }}>
          <Button>Preview another</Button>
        </QueryLink>
      </div>
    </Alert>
  );
}
