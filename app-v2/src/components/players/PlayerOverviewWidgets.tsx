import { Metric, PlayerDetails, formatNumber, isMetric } from "@wise-old-man/utils";
import { Label } from "../Label";
import { MetricIconSmall } from "../Icon";

import CheckIcon from "~/assets/check.svg";

export function PlayerOverviewWidgets(props: PlayerDetails) {
  if (!props.latestSnapshot) return null;

  const { data } = props.latestSnapshot;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      <Stat metric="combat" label="Combat Lvl." value={props.combatLevel} />
      <Stat metric={Metric.OVERALL} label="Overall exp." value={data.skills.overall.experience} />
      <Stat metric={Metric.EHP} label="EHP" value={data.computed.ehp.value || 0} />
      <Stat metric={Metric.EHB} label="EHB" value={data.computed.ehb.value || 0} />
      {props.ttm === 0 ? (
        <Stat metric="tt200m" label="Time to 200m all" value={props.tt200m} />
      ) : (
        <Stat metric="ttm" label="Time to max" value={props.ttm} />
      )}
    </div>
  );
}

interface StatProps {
  metric: Metric | "combat" | "ttm" | "tt200m";
  label: string;
  value: number;
}

function Stat(props: StatProps) {
  const { metric, label, value } = props;

  let valueElement: React.ReactNode;

  if (metric === "ttm") {
    if (value <= 0) {
      valueElement = (
        <span className="flex items-center">
          <CheckIcon className="-ml-0.5 mr-1 h-4 w-4 text-green-500" />
          Maxed
        </span>
      );
    } else {
      valueElement = <span>{formatNumber(Math.round(value), true)} hours</span>;
    }
  } else if (metric === "tt200m") {
    if (value <= 0) {
      valueElement = (
        <span className="flex items-center">
          <CheckIcon className="-ml-0.5 mr-1 h-4 w-4 text-green-500" />
          Maxed
        </span>
      );
    } else {
      valueElement = <span>{formatNumber(Math.round(value), true)} hours</span>;
    }
  } else {
    valueElement = formatNumber(Math.round(value), true);
  }

  return (
    <div className="group flex h-[4rem] w-full flex-col items-start justify-center gap-y-1 rounded-lg border border-gray-600 px-4">
      <Label className="line-clamp-1 text-xs text-gray-200">{label}</Label>
      <div className="flex items-end gap-x-2">
        {(isMetric(metric) || metric === "combat") && <MetricIconSmall metric={metric} />}
        <span className="line-clamp-1 text-sm leading-5 text-white">{valueElement}</span>
      </div>
    </div>
  );
}
