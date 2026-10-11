"use client";

import { Time } from "@internationalized/date";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  CreateCompetitionPayload,
  Metric,
  MetricProps,
  MetricType,
  SKILLS,
} from "@wise-old-man/utils";
import { PropsWithChildren, useMemo, useState } from "react";
import { DateValue, TimeValue } from "react-aria";
import { useHasMounted } from "~/hooks/useHasMounted";
import { Alert, AlertDescription } from "../Alert";
import { Button } from "../Button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxTrigger,
} from "../Combobox";
import { DateTimePicker, TimeField, toCalendarDate, toDate } from "../DatePicker";
import { MetricIcon, MetricIconSmall } from "../Icon";
import { Input } from "../Input";
import { Label } from "../Label";

import ChevronDownIcon from "~/assets/chevron_down.svg";
import CloseIcon from "~/assets/close.svg";
import LoadingIcon from "~/assets/loading.svg";
import PlusIcon from "~/assets/plus.svg";

const MAX_NAME_LENGTH = 50;

type TimezoneOption = "utc" | "local";

type Payload = Pick<
  Extract<CreateCompetitionPayload, { metrics: Metric[] }>, // TODO: can remove this Extract when this payload no longer has a union of (metric | metrics)
  "title" | "metrics" | "startsAt" | "endsAt"
>;

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
    {
      title,
      metrics,
      startsAt: toDate(startDate, startTime),
      endsAt: toDate(endDate, endTime),
    },
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
      <CompetitionFormMetricPicker metrics={metrics} onMetricsChanged={setMetrics} />
      <div className="overflow-hidden rounded-md border border-gray-500">
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

function CompetitionFormMetricPicker(props: {
  metrics: Metric[];
  onMetricsChanged: (metrics: Metric[]) => void;
}) {
  function handleRemoveMetric(metric: Metric) {
    props.onMetricsChanged(props.metrics.filter((m) => m !== metric));
  }

  return (
    <div>
      <div className="-mb-2 flex justify-center rounded-md bg-blue-500 pb-4 pt-2 text-xs text-white">
        🎉 New! You can now select multiple skills, bosses or activities in the same competition
      </div>
      <div className="overflow-hidden rounded-md border border-gray-500 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-500 p-4">
          <div className="flex flex-col gap-1">
            <Label>Metrics</Label>
            <span className="text-body text-gray-200">Choose what participants will compete in.</span>
          </div>
          <MetricDropdown metrics={props.metrics} onMetricsSelected={props.onMetricsChanged}>
            <Button>
              <PlusIcon className="-ml-1.5 h-4 w-4" />
              Add metric
            </Button>
          </MetricDropdown>
        </div>
        <div>
          {props.metrics.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-body text-gray-200">
                No metrics selected yet. Add a skill, boss or activity to get started.
              </p>
            </div>
          ) : (
            <div>
              <ul>
                {props.metrics.map((m) => (
                  <li
                    key={m}
                    className="flex items-center justify-between border-b border-gray-500 px-4 py-3 last:border-b-0"
                  >
                    <div className="flex h-8 items-center gap-x-3">
                      <MetricIcon metric={m} />
                      <span className="text-sm font-semibold">{MetricProps[m].name}</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${MetricProps[m].name}`}
                      className="rounded p-1 hover:bg-gray-500"
                      onClick={() => handleRemoveMetric(m)}
                    >
                      <CloseIcon className="h-4 w-4 text-gray-200" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricDropdown(
  props: PropsWithChildren<{
    metrics: Metric[];
    onMetricsSelected: (metric: Metric[]) => void;
  }>,
) {
  const { metrics, onMetricsSelected } = props;
  const metricType = MetricProps[metrics[0]]?.type;

  return (
    <Combobox
      multiple
      closeOnSelect
      value={metrics}
      onValueChanged={(val) => onMetricsSelected(val as Metric[])}
    >
      <ComboboxTrigger asChild>{props.children}</ComboboxTrigger>
      <ComboboxContent className="max-h-64" align="end">
        <ComboboxInput placeholder="Search metrics..." />
        <ComboboxEmpty>No results were found</ComboboxEmpty>
        <ComboboxItemsContainer>
          {(metricType === undefined || metricType === MetricType.SKILL) && (
            <ComboboxItemGroup label="Skills">
              {SKILLS.map((skill) => (
                <ComboboxItem key={skill} value={skill}>
                  <MetricIconSmall metric={skill} />
                  {MetricProps[skill].name}
                </ComboboxItem>
              ))}
            </ComboboxItemGroup>
          )}
          {(metricType === undefined || metricType === MetricType.BOSS) && (
            <ComboboxItemGroup label="Bosses">
              {BOSSES.map((boss) => (
                <ComboboxItem key={boss} value={boss}>
                  <MetricIconSmall metric={boss} />
                  {MetricProps[boss].name}
                </ComboboxItem>
              ))}
            </ComboboxItemGroup>
          )}
          {(metricType === undefined || metricType === MetricType.ACTIVITY) && (
            <ComboboxItemGroup label="Activities">
              {ACTIVITIES.map((activity) => (
                <ComboboxItem key={activity} value={activity}>
                  <MetricIconSmall metric={activity} />
                  {MetricProps[activity].name}
                </ComboboxItem>
              ))}
            </ComboboxItemGroup>
          )}
          {(metricType === undefined || metricType === MetricType.COMPUTED) && (
            <ComboboxItemGroup label="Computed">
              {COMPUTED_METRICS.map((computed) => (
                <ComboboxItem key={computed} value={computed}>
                  <MetricIconSmall metric={computed} />
                  {MetricProps[computed].name}
                </ComboboxItem>
              ))}
            </ComboboxItemGroup>
          )}
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
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
    !hasSameMetrics(previous.metrics, next.metrics) ||
    previous.startsAt.getTime() !== startsAt.getTime() ||
    previous.endsAt.getTime() !== endsAt.getTime()
  );
}

function hasSameMetrics(previous: Metric[], next: Metric[]) {
  const nextSet = new Set(next);
  return previous.every((metric) => nextSet.has(metric)) && previous.length === next.length;
}
