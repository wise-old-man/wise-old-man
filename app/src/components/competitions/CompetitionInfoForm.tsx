"use client";

import { Time } from "@internationalized/date";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  Metric,
  MetricProps,
  MetricType,
  SKILLS,
  isMetric,
} from "@wise-old-man/utils";
import { Fragment, useMemo, useState } from "react";
import { DateValue, TimeValue } from "react-aria";
import { useHasMounted } from "~/hooks/useHasMounted";
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
  ComboboxTrigger,
} from "../Combobox";
import { DateTimePicker, TimeField, toCalendarDate, toDate } from "../DatePicker";
import { MetricIconSmall } from "../Icon";
import { Input } from "../Input";
import { Label } from "../Label";
import { Alert, AlertDescription } from "../Alert";
import { Badge } from "../Badge";

import LoadingIcon from "~/assets/loading.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";
import CloseIcon from "~/assets/close.svg";

const MAX_NAME_LENGTH = 50;

const METRIC_GROUPS: Array<{ type: MetricType; label: string; metrics: Metric[] }> = [
  { type: MetricType.SKILL, label: "Skills", metrics: SKILLS },
  { type: MetricType.BOSS, label: "Bosses", metrics: BOSSES },
  { type: MetricType.ACTIVITY, label: "Activities", metrics: ACTIVITIES },
  { type: MetricType.COMPUTED, label: "Computed", metrics: COMPUTED_METRICS },
];

type TimezoneOption = "utc" | "local";
type Payload = {
  title: string;
  metrics: Metric[];
  startsAt: Date;
  endsAt: Date;
};

interface CompetitionInfoFormProps {
  mode: "create" | "edit";

  competition: Payload;
  onCompetitionChanged: (competition: Payload) => void;

  timezone: TimezoneOption;
  onTimezoneChanged: (timezone: TimezoneOption) => void;

  formActions: (disabled: boolean, hasUnsavedChanges: boolean) => JSX.Element;
}

export function CompetitionInfoForm(props: CompetitionInfoFormProps) {
  const { mode, competition, onCompetitionChanged, timezone, onTimezoneChanged } = props;

  const hasMounted = useHasMounted();

  const [title, setTitle] = useState(competition.title);
  const [metrics, setMetrics] = useState(competition.metrics);

  const timezoneOffset = useMemo(() => {
    return timezone === "utc" ? new Date().getTimezoneOffset() * 60_000 : 0;
  }, [timezone]);

  const { startsAt, endsAt } = useMemo(() => {
    return {
      startsAt: new Date(competition.startsAt.getTime() + timezoneOffset),
      endsAt: new Date(competition.endsAt.getTime() + timezoneOffset),
    };
  }, [competition, timezoneOffset]);

  const [startDate, setStartDate] = useState<DateValue>(toCalendarDate(startsAt));
  const [startTime, setStartTime] = useState<TimeValue>(
    new Time(startsAt.getHours(), startsAt.getMinutes()),
  );

  const [endDate, setEndDate] = useState<DateValue>(toCalendarDate(endsAt));
  const [endTime, setEndTime] = useState<TimeValue>(new Time(endsAt.getHours(), endsAt.getMinutes()));

  const hasUnsavedChanges = checkUnsavedChanges(
    competition,
    { title, metrics, startsAt: toDate(startDate, startTime), endsAt: toDate(endDate, endTime) },
    timezone,
  );

  const hasPastStartDate = toDate(startDate, startTime).getTime() < Date.now();
  const hasPastEndDate = toDate(endDate, endTime).getTime() < Date.now();

  const isEndDateAfterStartDate =
    toDate(endDate, endTime).getTime() > toDate(startDate, startTime).getTime();

  function handleSubmit() {
    const startsAt = new Date(toDate(startDate, startTime).getTime() + timezoneOffset);
    const endsAt = new Date(toDate(endDate, endTime).getTime() + timezoneOffset);

    onCompetitionChanged({ ...competition, title, metrics, startsAt, endsAt });
  }

  if (!hasMounted) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingIcon className="h-7 w-7 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-y-7"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <Label htmlFor="title" className="mb-2 block text-xs text-gray-200">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Ex: Herblore - Skill of the Week"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          autoFocus
          rightElement={
            <span className="text-xs tabular-nums text-gray-200">
              {title.length} / {MAX_NAME_LENGTH}
            </span>
          }
        />
      </div>
      <div>
        <Label htmlFor="title" className="mb-2 block text-xs text-gray-200">
          Metrics
        </Label>
        <MetricSelect metrics={metrics} onMetricsChanged={setMetrics} />
        <p className="mt-2 text-xs text-gray-200">
          All metrics in a competition must be of the same type. To switch to a different type, remove
          your currently selected metrics first.
        </p>
      </div>
      <div className="overflow-hidden rounded-md border border-gray-500 bg-gray-800">
        <div className="border-b border-gray-500 p-4">
          <TimezoneSelector timezone={timezone} onTimezoneChanged={onTimezoneChanged} />
          <span className="text-body text-gray-200">
            {`The dates below are shown in `}
            {timezone === "local" ? `your local timezone (${getTimezoneNameAndOffset()})` : "UTC"}
          </span>
        </div>
        <div className="p-4">
          <div className="flex grow gap-x-4">
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">Start date</Label>
              <DateTimePicker inDialog value={startDate} onChange={setStartDate} />
            </div>
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">Start time</Label>
              <TimeField value={startTime} onChange={setStartTime} />
            </div>
          </div>
          {mode === "create" && hasPastStartDate && (
            <Alert className="mt-3 px-4 py-3" variant="error">
              <AlertDescription className="text-white">
                The start date and time you selected is in the past. Please select a future date.
              </AlertDescription>
            </Alert>
          )}
          <div className="mt-5 flex grow gap-x-4">
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">End date</Label>
              <DateTimePicker inDialog value={endDate} onChange={setEndDate} />
            </div>
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">End time</Label>
              <TimeField value={endTime} onChange={setEndTime} />
            </div>
          </div>
          {mode === "create" && hasPastEndDate && (
            <Alert className="mt-3 px-4 py-3" variant="error">
              <AlertDescription className="text-white">
                The end date/time you selected is in the past. Please select a future date.
              </AlertDescription>
            </Alert>
          )}
          {!isEndDateAfterStartDate && (
            <Alert className="mt-3 px-4 py-3" variant="error">
              <AlertDescription className="text-white">
                The end date/time you selected is before the start date/time.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      {/* Allow the parent pages to render what they need on the actions slot (Previous/Next or Save) */}
      {props.formActions(
        title.length === 0 ||
          metrics.length === 0 ||
          !isEndDateAfterStartDate ||
          (mode === "create" && (hasPastStartDate || hasPastEndDate)),
        hasUnsavedChanges,
      )}
    </form>
  );
}

interface TimezoneSelectorProps {
  timezone: "local" | "utc";
  onTimezoneChanged: (val: "local" | "utc") => void;
}

function TimezoneSelector(props: TimezoneSelectorProps) {
  const { timezone, onTimezoneChanged } = props;

  return (
    <Combobox
      value={timezone}
      onValueChanged={(val) => {
        onTimezoneChanged(val === "utc" ? "utc" : "local");
      }}
    >
      <ComboboxTrigger className="flex items-center gap-x-1 text-sm font-medium text-white hover:text-gray-100">
        {timezone === "local" ? "Local timezone" : "UTC"}
        <ChevronDownIcon className="h-4 w-4" />
      </ComboboxTrigger>
      <ComboboxContent align="start">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            <ComboboxItem value="local">
              Local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </ComboboxItem>
            <ComboboxItem value="utc">UTC</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

interface MetricSelectProps {
  metrics: Metric[];
  onMetricsChanged: (metrics: Metric[]) => void;
}

function MetricSelect(props: MetricSelectProps) {
  const { metrics, onMetricsChanged } = props;

  const selectedType = metrics.length > 0 ? MetricProps[metrics[0]].type : undefined;
  const selectedSet = new Set(metrics);

  // Once a metric is selected, only metrics of that same type can be added. To switch to a
  // different type, the user must first remove all of their currently selected metrics.
  const availableGroups =
    selectedType === undefined
      ? METRIC_GROUPS
      : METRIC_GROUPS.filter((group) => group.type === selectedType);

  function handleSelect(metric: Metric) {
    if (selectedSet.has(metric)) {
      handleRemove(metric);
    } else {
      onMetricsChanged([...metrics, metric]);
    }
  }

  function handleRemove(metric: Metric) {
    onMetricsChanged(metrics.filter((m) => m !== metric));
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Combobox
        value={undefined}
        onValueChanged={(val) => {
          if (val !== undefined && isMetric(val)) {
            handleSelect(val);
          }
        }}
      >
        <ComboboxButton className="w-full bg-gray-800 hover:bg-gray-700">
          <span className="line-clamp-1 text-left text-gray-100">
            {metrics.length === 0 ? "Select a metric..." : "Add another metric..."}
          </span>
        </ComboboxButton>
        <ComboboxContent>
          <ComboboxInput placeholder="Search metrics..." />
          <ComboboxEmpty>No results were found</ComboboxEmpty>
          <ComboboxItemsContainer>
            {availableGroups.map((group, index) => {
              const options = group.metrics.filter((metric) => !selectedSet.has(metric));

              if (options.length === 0) return null;

              return (
                <Fragment key={group.type}>
                  {index > 0 && <ComboboxSeparator />}
                  <ComboboxItemGroup label={group.label}>
                    {options.map((metric) => (
                      <ComboboxItem key={metric} value={metric}>
                        <MetricIconSmall metric={metric} />
                        {MetricProps[metric].name}
                      </ComboboxItem>
                    ))}
                  </ComboboxItemGroup>
                </Fragment>
              );
            })}
          </ComboboxItemsContainer>
        </ComboboxContent>
      </Combobox>

      {metrics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <Badge
              key={metric}
              variant="outline"
              className="flex items-center gap-x-1.5 py-1 pl-1.5 pr-1"
            >
              <MetricIconSmall metric={metric} />
              <span className="text-xs font-medium text-white">{MetricProps[metric].name}</span>
              <button
                type="button"
                aria-label={`Remove ${MetricProps[metric].name}`}
                onClick={() => handleRemove(metric)}
                className="rounded-full p-0.5 text-gray-200 transition-colors hover:bg-gray-500 hover:text-white"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function getTimezoneNameAndOffset() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset() / -60;

  if (offset === 0) return timezone;

  return `${timezone}, UTC${offset > 0 ? "+" : ""}${offset}`;
}

function checkUnsavedChanges(previous: Payload, next: Payload, timezone: TimezoneOption) {
  let startsAt = next.startsAt;
  let endsAt = next.endsAt;

  if (timezone === "utc") {
    const offsetMs = new Date().getTimezoneOffset() * -1 * 60_000;

    startsAt = new Date(startsAt.getTime() + offsetMs);
    endsAt = new Date(endsAt.getTime() + offsetMs);
  }

  return (
    previous.title !== next.title ||
    !haveSameMetrics(previous.metrics, next.metrics) ||
    previous.startsAt.getTime() !== startsAt.getTime() ||
    previous.endsAt.getTime() !== endsAt.getTime()
  );
}

function haveSameMetrics(previous: Metric[], next: Metric[]) {
  if (previous.length !== next.length) return false;

  const nextSet = new Set(next);
  return previous.every((metric) => nextSet.has(metric));
}
