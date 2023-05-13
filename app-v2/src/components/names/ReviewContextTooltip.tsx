import { Metric, MetricProps, NameChange, NameChangeStatus, formatNumber } from "@wise-old-man/utils";
import { PropsWithChildren } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { MetricIconSmall } from "../Icon";

export function ReviewContextTooltip(props: PropsWithChildren<NameChange>) {
  const { children, ...nameChange } = props;

  if (!nameChange.reviewContext) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent align="end" side="bottom" className="border-gray-600 p-6">
        <h3 className="text-h3 font-medium">
          {nameChange.status === NameChangeStatus.DENIED ? "Why was it denied?" : "Why was it skipped?"}
        </h3>
        <p className="mb-7 mt-2 whitespace-pre-wrap text-body text-gray-200">
          <ReviewContextContent {...nameChange} />
        </p>
        <span className="text-gray-100">
          Need help?&nbsp;
          <a
            href="https://wiseoldman.net/discord"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-400 hover:underline"
          >
            Join our Discord
          </a>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

function ReviewContextContent(props: NameChange) {
  if (!props.reviewContext) return null;

  const { reviewContext } = props;

  if (reviewContext.reason === "transition_period_too_long") {
    const { hoursDiff, maxHoursDiff } = reviewContext;

    return (
      <>
        This name change has been skipped during auto-review because there is&nbsp;
        {Math.floor(hoursDiff)} hours in between the old name&apos;s last update and the new name&apos;s
        first update. Any period over {maxHoursDiff} hours has to be manually reviewed by our team.
        Please reach out to us for manual review.
      </>
    );
  }

  if (reviewContext.reason === "excessive_gains") {
    const { hoursDiff, ehpDiff, ehbDiff } = reviewContext;

    return (
      <>
        This name change has been skipped during auto-review because there are excessive gains between
        the two names.
        <br />
        <br />
        EHP: +{Math.floor(ehpDiff)}
        <br />
        EHB: +{Math.floor(ehbDiff)}
        <br />
        Hours in between: {Math.floor(hoursDiff)}
      </>
    );
  }

  if (reviewContext.reason === "total_level_too_low") {
    const { minTotalLevel, totalLevel } = reviewContext;

    return (
      <>
        This name change has been skipped during auto-review because the old username&apos;s total level
        is too low ({totalLevel}), and therefore easier to fake a name change. Any total level below{" "}
        {minTotalLevel} has to be manually reviewed by our team. Please reach out to us for manual
        review.
      </>
    );
  }

  if (reviewContext.reason === "manual_review") {
    return <>This name change has been manually reviewed and denied by our moderation team.</>;
  }

  if (reviewContext.reason === "old_stats_cannot_be_found") {
    return (
      <>
        This name change has been auto-denied because &quot;{props.oldName}&quot; did not have any valid
        stats data on WOM.
        <br />
        <br />
        If you insist on transfering this name despite not having any useful data to transfer, feel free
        to reach out to us on Discord.
      </>
    );
  }

  if (reviewContext.reason === "new_name_not_on_the_hiscores") {
    return (
      <>
        This name change has been auto-denied because &quot;{props.newName}&quot; could not be found on
        the hiscores. This can either mean that name doesn&apos;t exist, has been banned or that it
        isn&apos;t high enough level to be ranked in any skills.
      </>
    );
  }

  if (reviewContext.reason === "negative_gains") {
    const { negativeGains } = reviewContext;

    return (
      <>
        This name change has been denied because it there are negative gains between the two names.
        <span className="mt-4 block font-medium text-gray-100">Negative gains:</span>
        <ul className="mt-1">
          {Object.keys(negativeGains)
            .slice(0, 5)
            .sort((a, b) => negativeGains[a as Metric] - negativeGains[b as Metric])
            .map((metric) => (
              <li key={metric} className="mt-1 flex items-center">
                <MetricIconSmall metric={metric as Metric} />
                <span className="ml-1 block text-gray-100">{MetricProps[metric as Metric].name}:</span>
                <span className="ml-2">{formatNumber(negativeGains[metric as Metric])}</span>
              </li>
            ))}
          {Object.keys(negativeGains).length > 5 && (
            <li className="mt-1">(And {Object.keys(negativeGains).length - 5} more)</li>
          )}
        </ul>
      </>
    );
  }

  return <>Unknown.</>;
}
