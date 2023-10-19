"use client";

import { Time } from "@internationalized/date";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation } from "@tanstack/react-query";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  CompetitionType,
  CreateCompetitionPayload,
  GroupDetails,
  GroupListItem,
  Metric,
  MetricProps,
  SKILLS,
  WOMClient,
  isMetric,
} from "@wise-old-man/utils";
import Link from "next/link";
import { DateValue, TimeValue } from "react-aria";
import { createContext, useContext, useState } from "react";
import { useToast } from "~/hooks/useToast";
import { useHasMounted } from "~/hooks/useHasMounted";
import { cn } from "~/utils/styling";
import { standardizeUsername } from "~/utils/strings";
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
  ComboboxSeparator,
  ComboboxTrigger,
} from "../Combobox";
import { Input } from "../Input";
import { Label } from "../Label";
import { Switch } from "../Switch";
import { Container } from "../Container";
import { MetricIconSmall } from "../Icon";
import { DataTable } from "../DataTable";
import { PlayerSearch } from "../PlayerSearch";
import { Alert, AlertDescription } from "../Alert";
import { CompetitionTypeSelector } from "./CompetitionTypeSelector";
import { DateTimePicker, TimeField, toCalendarDate, toDate } from "../DatePicker";
import { GroupSearch } from "../groups/GroupSearch";

import CloseIcon from "~/assets/close.svg";
import LoadingIcon from "~/assets/loading.svg";
import VerifiedIcon from "~/assets/verified.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

const MAX_NAME_LENGTH = 50;

type TimezoneOption = "utc" | "local";
type FormStep = "info" | "group" | "participants";

const CreateCompetitionContext = createContext<
  | {
      group: GroupListItem | undefined;
      setGroup: (group: GroupListItem | undefined) => void;

      groupVerificationCode: string | undefined;
      setGroupVerificationCode: (code: string) => void;

      type: CompetitionType;
      setType: (type: CompetitionType) => void;

      competition: CreateCompetitionPayload;
      setCompetition: (competition: CreateCompetitionPayload) => void;

      step: FormStep;
      setStep: (step: FormStep) => void;

      timezone: TimezoneOption;
      setTimezone: (timezone: TimezoneOption) => void;
    }
  | undefined
>(undefined);

function useFormContext() {
  const ctx = useContext(CreateCompetitionContext);
  if (!ctx) throw new Error("No Context.Provider found when calling useContext.");
  return ctx;
}

interface CreateCompetitionFormProps {
  group?: GroupDetails;
}

export function CreateCompetitionForm(props: CreateCompetitionFormProps) {
  const [group, setGroup] = useState<GroupListItem | undefined>(props.group);
  const [groupVerificationCode, setGroupVerificationCode] = useState("");

  const [step, setStep] = useState<FormStep>("info");
  const [timezone, setTimezone] = useState<TimezoneOption>("local");

  const [type, setType] = useState<CompetitionType>(CompetitionType.CLASSIC);
  const [competition, setCompetition] = useState<CreateCompetitionPayload>({
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
    <CreateCompetitionContext.Provider
      value={{
        group,
        setGroup,
        groupVerificationCode,
        setGroupVerificationCode,
        step,
        setStep,
        timezone,
        setTimezone,
        type,
        setType,
        competition,
        setCompetition,
      }}
    >
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
          {step === "info" && <InfoForm />}
          {step === "group" && <GroupForm />}
          {step === "participants" && <TypeAndParticipantsForm />}
        </div>
      </Container>
    </CreateCompetitionContext.Provider>
  );
}

function InfoForm() {
  const ctx = useFormContext();

  const hasMounted = useHasMounted();

  const [title, setTitle] = useState(ctx.competition.title);
  const [metric, setMetric] = useState<Metric>(ctx.competition.metric);

  const [startDate, setStartDate] = useState<DateValue>(toCalendarDate(ctx.competition.startsAt));
  const [startTime, setStartTime] = useState<TimeValue>(
    new Time(ctx.competition.startsAt.getHours(), ctx.competition.startsAt.getMinutes())
  );

  const [endDate, setEndDate] = useState<DateValue>(toCalendarDate(ctx.competition.endsAt));
  const [endTime, setEndTime] = useState<TimeValue>(
    new Time(ctx.competition.endsAt.getHours(), ctx.competition.endsAt.getMinutes())
  );

  function handleSubmit() {
    let startsAt = toDate(startDate, startTime);
    let endsAt = toDate(endDate, endTime);

    if (ctx.timezone === "utc") {
      const offsetMs = new Date().getTimezoneOffset() * -1 * 60_000;

      startsAt = new Date(startsAt.getTime() + offsetMs);
      endsAt = new Date(endsAt.getTime() + offsetMs);
    }

    ctx.setStep("group");
    ctx.setCompetition({ ...ctx.competition, title, metric, startsAt, endsAt });
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
          <TimezoneSelector timezone={ctx.timezone} onTimezoneChanged={ctx.setTimezone} />
          <span className="text-body text-gray-200">
            {`The dates below are shown in `}
            {ctx.timezone === "local" ? `your local timezone (${getTimezoneNameAndOffset()})` : "UTC"}
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

      <div className="flex justify-end">
        <Button variant="blue" disabled={title.length === 0}>
          Next
        </Button>
      </div>
    </form>
  );
}

function GroupForm() {
  const toast = useToast();
  const ctx = useFormContext();

  const [isGroupCompetition, setIsGroupCompetition] = useState(!!ctx.group);
  const [groupVerificationCode, setGroupVerificationCode] = useState(ctx.groupVerificationCode);

  const canContinue =
    !isGroupCompetition || (ctx.group && groupVerificationCode && groupVerificationCode.length === 11);

  const checkMutation = useMutation({
    mutationFn: async () => {
      if (!ctx.group || !groupVerificationCode) return;

      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      try {
        await client.groups.editGroup(ctx.group.id, {}, groupVerificationCode);
      } catch (error) {
        if (!(error instanceof Error) || !("statusCode" in error)) throw new Error();

        // If it failed with 400 (Bad Request), that means it got through the code validation checks
        // and just failed due to an empty payload (as expected)
        if (error.statusCode === 400) return groupVerificationCode;
        throw error;
      }
    },
    onError: () => {
      toast.toast({ variant: "error", title: "Incorrect verification code." });
    },
    onSuccess: (code) => {
      if (code) {
        ctx.setStep("participants");
        ctx.setGroupVerificationCode(code);
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-y-7"
      onSubmit={(e) => {
        e.preventDefault();

        if (isGroupCompetition) {
          checkMutation.mutate();
        } else {
          ctx.setStep("participants");
        }
      }}
    >
      <Alert>
        <AlertDescription>
          <p>
            By linking your group as the host to this competition, all your group members will be
            automatically synced up as this competition&apos;s participants. You will also be able to
            edit/delete the competition using the group&apos;s verification code instead.
          </p>
          <p className="mt-5">
            Dont&apos;t have a group yet?{" "}
            <Link href="/groups/create" className="text-blue-400">
              Create one here
            </Link>
          </p>
        </AlertDescription>
      </Alert>

      <div>
        <span className="text-body">Is this a group competition?</span>
        <div className="mt-3 flex items-center gap-x-3">
          <Switch
            checked={isGroupCompetition}
            onCheckedChange={(val) => {
              setIsGroupCompetition(val);
              if (!val) ctx.setGroup(undefined);
            }}
          />
          <span>{isGroupCompetition ? "Yes" : "No"}</span>
        </div>
      </div>

      <div className={cn("mt-4", !isGroupCompetition && "pointer-events-none opacity-50")}>
        <div>
          <Label className="mb-2 block text-xs text-gray-200">Group selection</Label>
          <GroupSelector group={ctx.group} onGroupSelected={ctx.setGroup} />
        </div>
        <div className="mt-7">
          <Label htmlFor="code" className="mb-2 block text-xs text-gray-200">
            Group verification code
          </Label>
          <Input
            id="code"
            type="password"
            className="h-12"
            placeholder="Ex: 123-456-789"
            maxLength={11}
            value={groupVerificationCode}
            onChange={(e) => setGroupVerificationCode(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3 flex justify-between gap-x-3 border-t border-gray-500 py-5">
        <Button
          variant="outline"
          onClick={() => {
            ctx.setStep("info");
          }}
        >
          <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
          Previous
        </Button>
        <Button variant="blue" disabled={!canContinue || checkMutation.isPending}>
          {checkMutation.isPending ? "Checking..." : "Next"}
          <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function TypeAndParticipantsForm() {
  const ctx = useFormContext();

  function handleSubmit() {
    console.log("submit!!");
  }

  return (
    <form
      className="flex flex-col gap-y-12"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <Label htmlFor="type" className="mb-2 block text-xs text-gray-200">
          Type
        </Label>
        <CompetitionTypeSelector
          id="type"
          type={ctx.type}
          onTypeChanged={(type) => {
            ctx.setType(type);

            if (type === CompetitionType.CLASSIC) {
              ctx.setCompetition({ ...ctx.competition, participants: [] });
            } else {
              ctx.setCompetition({ ...ctx.competition, teams: [] });
            }
          }}
        />
      </div>
      <div>
        {ctx.type === CompetitionType.CLASSIC ? (
          <>
            {ctx.group ? (
              <>
                <Label className="mb-2 block text-xs text-gray-200">Participants</Label>
                <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-gray-500 px-16 text-center text-xs leading-5 text-gray-200">
                  All {ctx.group.name} members will be automatically added as participants.
                </div>
              </>
            ) : (
              <ParticipantsSelection />
            )}
          </>
        ) : (
          <>
            <Label className="mb-2 block text-xs text-gray-200">Teams</Label>
            <TeamsSelection />
          </>
        )}
      </div>
      <div className="mt-3 flex justify-between gap-x-3 border-t border-gray-500 py-5">
        <Button
          variant="outline"
          onClick={() => {
            ctx.setStep("group");
          }}
        >
          <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
          Previous
        </Button>
        <Button variant="blue">
          Next
          <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function ParticipantsSelection() {
  const ctx = useContext(CreateCompetitionContext);

  const participants =
    ctx && ctx.competition && "participants" in ctx.competition ? ctx.competition.participants : [];

  function handleAddPlayers(usernames: string) {
    if (!ctx) return;

    // Handle comma separated usernames
    const playersToAdd = usernames.split(",").filter((s) => s.length > 0);

    const unique: string[] = [];

    playersToAdd.forEach((p) => {
      if (unique.map(standardizeUsername).includes(standardizeUsername(p))) return;
      if (participants.map(standardizeUsername).includes(standardizeUsername(p))) return;

      unique.push(p);
    });

    ctx.setCompetition({ ...ctx.competition, participants: [...participants, ...unique] });
  }

  function handleRemovePlayer(username: string) {
    if (!ctx) return;

    ctx.setCompetition({
      ...ctx.competition,
      participants: participants.filter((p) => standardizeUsername(p) !== standardizeUsername(username)),
    });
  }

  const PARTICIPANTS_COLUMN_DEFS: ColumnDef<string>[] = [
    {
      accessorKey: "username",
      header: "Player",
      cell: ({ row }) => {
        return (
          <div className="pr-5 text-sm font-medium text-white">
            <Link href={`/players/${row.original}`} className="hover:underline">
              {row.original}
            </Link>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end text-sm text-gray-200">
            <Button size="sm" onClick={() => handleRemovePlayer(row.original)}>
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Label className="mb-2 block text-xs text-gray-200">
        Add participants ({participants.length})
      </Label>
      <PlayerSearch mode="select" onPlayerSelected={handleAddPlayers} />
      <div className="mt-7">
        {participants.length === 0 ? (
          <div className="flex justify-center rounded border border-dashed border-gray-400 p-7">
            <p className="max-w-xs text-center text-sm font-normal leading-6 text-gray-200">
              No participants yet. Please use the search bar above to start selecting players.
            </p>
          </div>
        ) : (
          <DataTable data={participants} columns={PARTICIPANTS_COLUMN_DEFS} enablePagination />
        )}
      </div>
    </>
  );
}

function TeamsSelection() {
  return <div>Teams selection</div>;
}

interface GroupSelectorProps {
  group?: GroupListItem;
  onGroupSelected: (group?: GroupListItem) => void;
}

function GroupSelector(props: GroupSelectorProps) {
  const { group, onGroupSelected } = props;

  if (group) {
    return (
      <div className="flex h-12 items-center justify-between rounded-md border border-gray-400 bg-gray-700 px-4 shadow-sm">
        <div>
          <div className="flex items-center gap-x-1.5 text-sm font-medium">
            {group.name}
            {group.verified && <VerifiedIcon className="h-4 w-4" />}
          </div>
        </div>
        <button onClick={() => onGroupSelected(undefined)}>
          <CloseIcon className="-mr-1 h-7 w-7 rounded p-1 text-gray-200 hover:bg-gray-600 hover:text-gray-100" />
        </button>
      </div>
    );
  }

  return <GroupSearch onGroupSelected={onGroupSelected} />;
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
