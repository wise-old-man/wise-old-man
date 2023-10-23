"use client";

import { Time } from "@internationalized/date";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  CreateCompetitionPayload,
  Metric,
  MetricProps,
  SKILLS,
  isMetric,
} from "@wise-old-man/utils";
import { useState } from "react";
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

import LoadingIcon from "~/assets/loading.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

const MAX_NAME_LENGTH = 50;

type TimezoneOption = "utc" | "local";
type Payload = Pick<CreateCompetitionPayload, "title" | "metric" | "startsAt" | "endsAt">;

interface CompetitionInfoFormProps {
  competition: Payload;
  onCompetitionChanged: (competition: Payload) => void;

  timezone: TimezoneOption;
  onTimezoneChanged: (timezone: TimezoneOption) => void;

  formActions: (disabled: boolean, hasUnsavedChanges: boolean) => JSX.Element;
}

export function CompetitionInfoForm(props: CompetitionInfoFormProps) {
  const { competition, onCompetitionChanged, timezone, onTimezoneChanged } = props;

  const hasMounted = useHasMounted();

  const [title, setTitle] = useState(competition.title);
  const [metric, setMetric] = useState<Metric>(competition.metric);

  let startsAt = competition.startsAt;
  let endsAt = competition.endsAt;

  if (timezone === "utc") {
    const offsetMs = new Date().getTimezoneOffset() * 60_000;
    startsAt = new Date(startsAt.getTime() + offsetMs);
    endsAt = new Date(endsAt.getTime() + offsetMs);
  }

  const [startDate, setStartDate] = useState<DateValue>(toCalendarDate(startsAt));
  const [startTime, setStartTime] = useState<TimeValue>(
    new Time(startsAt.getHours(), startsAt.getMinutes())
  );

  const [endDate, setEndDate] = useState<DateValue>(toCalendarDate(endsAt));
  const [endTime, setEndTime] = useState<TimeValue>(new Time(endsAt.getHours(), endsAt.getMinutes()));

  const hasUnsavedChanges = checkUnsavedChanges(
    competition,
    { title, metric, startsAt: toDate(startDate, startTime), endsAt: toDate(endDate, endTime) },
    timezone
  );

  function handleSubmit() {
    let startsAt = toDate(startDate, startTime);
    let endsAt = toDate(endDate, endTime);

    if (timezone === "utc") {
      const offsetMs = new Date().getTimezoneOffset() * -1 * 60_000;

      startsAt = new Date(startsAt.getTime() + offsetMs);
      endsAt = new Date(endsAt.getTime() + offsetMs);
    }

    onCompetitionChanged({ ...competition, title, metric, startsAt, endsAt });
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
          Metric
        </Label>
        <MetricSelect metric={metric} onMetricSelected={setMetric} />
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
        </div>
      </div>
      {/* Allow the parent pages to render what they need on the actions slot (Previous/Next or Save) */}
      {props.formActions(title.length === 0, hasUnsavedChanges)}
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
      <ComboboxButton className="w-full bg-gray-800 hover:bg-gray-700">
        <div className="flex items-center gap-x-2">
          <MetricIconSmall metric={metric} />
          <span className="line-clamp-1 text-left">{MetricProps[metric].name} </span>
        </div>
      </ComboboxButton>
      <ComboboxContent className="max-h-64">
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
    previous.metric !== next.metric ||
    previous.startsAt.getTime() !== startsAt.getTime() ||
    previous.endsAt.getTime() !== endsAt.getTime()
  );
}
