"use client";

import { Time } from "@internationalized/date";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  CompetitionDetails,
  CreateCompetitionPayload,
  Metric,
  MetricProps,
  SKILLS,
  isMetric,
} from "@wise-old-man/utils";
import { createContext, useState } from "react";
import { DateValue, TimeValue } from "react-aria";
import { useHasMounted } from "~/hooks/useHasMounted";
import { cn } from "~/utils/styling";
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
import { Container } from "../Container";
import { DateTimePicker, TimeField, toCalendarDate, toDate } from "../DatePicker";
import { MetricIconSmall } from "../Icon";
import { Input } from "../Input";
import { Label } from "../Label";

import LoadingIcon from "~/assets/loading.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

const MAX_NAME_LENGTH = 50;

type TimezoneOption = "utc" | "local";
type FormStep = "info" | "group" | "participants";

const CreateCompetitionContext = createContext({
  step: "info" as FormStep,
  timezone: "local" as TimezoneOption,
  setStep: (_step: FormStep) => {},
  setTimezone: (_timezone: TimezoneOption) => {},
});

export function CreateCompetitionForm() {
  const [step, setStep] = useState<FormStep>("info");
  const [timezone, setTimezone] = useState<TimezoneOption>("local");

  const [payload, setPayload] = useState<CreateCompetitionPayload>({
    title: "",
    metric: Metric.OVERALL,
    startsAt: getDefaultStartDate(),
    endsAt: getDefaultEndDate(),
    participants: [],
  });

  const stepLabel = {
    info: "1. Basic information",
    group: "2. Host group",
    participants: "3. Participants",
  }[step];

  return (
    <CreateCompetitionContext.Provider value={{ step, timezone, setStep, setTimezone }}>
      <Container className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-bold">Create a new competition</h1>
        <div className="mt-5 flex gap-x-2">
          <div className="h-1 w-12 rounded-full bg-blue-500" />
          <div
            className={cn(
              "h-1 w-12 rounded-full transition-colors duration-300",
              step === "info" ? "bg-gray-500" : "bg-blue-500"
            )}
          />
          <div
            className={cn(
              "h-1 w-12 rounded-full transition-colors duration-300",
              step !== "participants" ? "bg-gray-500" : "bg-blue-500"
            )}
          />
        </div>
        <h2 className="mt-3 text-sm text-white">{stepLabel}</h2>
        <div className="mt-10">
          {step === "info" && (
            <InfoForm
              timezone={timezone}
              competition={payload}
              onTimezoneChanged={setTimezone}
              onSubmit={(title, metric, startsAt, endsAt) => {
                setPayload({ ...payload, title, metric, startsAt, endsAt });
                setStep("group");
              }}
            />
          )}
        </div>
      </Container>
    </CreateCompetitionContext.Provider>
  );
}

interface InfoFormProps {
  timezone: TimezoneOption;
  competition: Pick<CompetitionDetails, "title" | "metric" | "startsAt" | "endsAt">;
  onTimezoneChanged: (timezone: TimezoneOption) => void;
  onSubmit: (title: string, metric: Metric, startsAt: Date, endsAt: Date) => void;
}

function InfoForm(props: InfoFormProps) {
  const { timezone, competition, onSubmit, onTimezoneChanged } = props;

  const hasMounted = useHasMounted();

  const [title, setTitle] = useState(competition.title);
  const [metric, setMetric] = useState<Metric>(competition.metric);

  const [startDate, setStartDate] = useState<DateValue>(toCalendarDate(competition.startsAt));
  const [startTime, setStartTime] = useState<TimeValue>(
    new Time(competition.startsAt.getHours(), competition.startsAt.getMinutes())
  );

  const [endDate, setEndDate] = useState<DateValue>(toCalendarDate(competition.endsAt));
  const [endTime, setEndTime] = useState<TimeValue>(
    new Time(competition.endsAt.getHours(), competition.endsAt.getMinutes())
  );

  function handleSubmit() {
    let startDateTime = toDate(startDate, startTime);
    let endDateTime = toDate(endDate, endTime);

    if (timezone === "utc") {
      const offsetMs = new Date().getTimezoneOffset() * -1 * 60_000;

      startDateTime = new Date(startDateTime.getTime() + offsetMs);
      endDateTime = new Date(endDateTime.getTime() + offsetMs);
    }

    onSubmit(title, metric, startDateTime, endDateTime);
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

      <button>Submit!</button>
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
      <ComboboxContent>
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

function getDefaultStartDate() {
  const now = new Date();
  now.setHours(20, 0, 0, 0);
  now.setDate(now.getDate() + 1);

  return now;
}

function getDefaultEndDate() {
  const now = new Date();
  now.setHours(20, 0, 0, 0);
  now.setDate(now.getDate() + 8);

  return now;
}
