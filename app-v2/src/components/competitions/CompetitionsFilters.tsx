"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCompetitionStatusParam,
  getCompetitionTypeParam,
  getMetricParam,
  getSearchParam,
} from "~/utils/params";
import useDebounceCallback from "~/hooks/useDebouncedCallback";
import { Input } from "~/components/Input";
import SearchIcon from "~/assets/search.svg";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  CompetitionStatus,
  CompetitionStatusProps,
  CompetitionType,
  CompetitionTypeProps,
  Metric,
  MetricProps,
  SKILLS,
  isCompetitionStatus,
  isCompetitionType,
  isMetric,
} from "@wise-old-man/utils";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxItemsContainer,
  ComboboxItemGroup,
  ComboboxItem,
  ComboboxSeparator,
} from "../Combobox";
import { cn } from "~/utils/styling";

export function CompetitionsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const search = getSearchParam(searchParams.get("search"));
  const metric = getMetricParam(searchParams.get("metric"));
  const type = getCompetitionTypeParam(searchParams.get("type"));
  const status = getCompetitionStatusParam(searchParams.get("status"));

  const [searchInput, setSearchInput] = useState(search);

  const debouncedUrlUpdate = useDebounceCallback(handleSearchChanged, 500);

  function handleParamChanged(paramName: string, paramValue: string | undefined) {
    const nextParams = new URLSearchParams(searchParams);

    if (paramValue) {
      nextParams.set(paramName, paramValue);
    } else {
      nextParams.delete(paramName);
    }

    // Reset pagination if params change
    nextParams.delete("page");

    startTransition(() => {
      router.push(`/competitions?${nextParams.toString()}`);
    });
  }

  function handleSearchChanged(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    if (value.trim().length > 0) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    // Reset pagination if params change
    nextParams.delete("page");

    startTransition(() => {
      router.push(`/competitions?${nextParams.toString()}`);
    });
  }

  return (
    <div
      className={cn(
        "mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      <Input
        value={searchInput}
        disabled={isPending}
        placeholder="Search competitions..."
        className="border-gray-600"
        containerClassName="md:max-w-xs w-full"
        leftElement={<SearchIcon className="h-5 w-5 text-gray-300" />}
        onChange={(e) => {
          setSearchInput(e.target.value);
          debouncedUrlUpdate(e.target.value);
        }}
      />
      <MetricSelect
        metric={metric}
        onMetricSelected={(newMetric) => handleParamChanged("metric", newMetric)}
      />
      <StatusSelect
        status={status}
        onStatusSelected={(newStatus) => handleParamChanged("status", newStatus)}
      />
      <TypeSelect type={type} onTypeSelected={(newType) => handleParamChanged("type", newType)} />
    </div>
  );
}

interface MetricSelectProps {
  metric: Metric | undefined;
  onMetricSelected: (metric: Metric | undefined) => void;
}

function MetricSelect(props: MetricSelectProps) {
  const { metric, onMetricSelected } = props;

  return (
    <Combobox
      value={metric}
      onValueChanged={(val) => {
        if (val === undefined || isMetric(val)) {
          onMetricSelected(val);
        }
      }}
    >
      <ComboboxButton className="py-5">
        <div className={cn("flex items-center gap-x-2", !metric && "text-gray-300")}>
          {metric && <MetricIcon metric={metric} />}
          <span className="line-clamp-1 text-left">{metric ? MetricProps[metric].name : "Metric"} </span>
        </div>
      </ComboboxButton>
      <ComboboxContent>
        <ComboboxInput placeholder="Search metrics..." />
        <ComboboxEmpty>No results were found</ComboboxEmpty>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Skills">
            {SKILLS.map((skill) => (
              <ComboboxItem key={skill} value={skill}>
                <MetricIcon metric={skill} />
                {MetricProps[skill].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
          <ComboboxSeparator />
          <ComboboxItemGroup label="Bosses">
            {BOSSES.map((boss) => (
              <ComboboxItem key={boss} value={boss}>
                <MetricIcon metric={boss} />
                {MetricProps[boss].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
          <ComboboxSeparator />
          <ComboboxItemGroup label="Activities">
            {ACTIVITIES.map((activity) => (
              <ComboboxItem key={activity} value={activity}>
                <MetricIcon metric={activity} />
                {MetricProps[activity].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
          <ComboboxItemGroup label="Computed">
            {COMPUTED_METRICS.map((computed) => (
              <ComboboxItem key={computed} value={computed}>
                <MetricIcon metric={computed} />
                {MetricProps[computed].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

interface StatusSelectProps {
  status: CompetitionStatus | undefined;
  onStatusSelected: (status: CompetitionStatus | undefined) => void;
}

function StatusSelect(props: StatusSelectProps) {
  const { status, onStatusSelected } = props;

  return (
    <Combobox
      value={status}
      onValueChanged={(val) => {
        if (val === undefined || isCompetitionStatus(val)) {
          onStatusSelected(val);
        }
      }}
    >
      <ComboboxButton className="py-5">
        <div className={cn("flex items-center gap-x-2", !status && "text-gray-300")}>
          {status && (
            <div
              className={cn("h-2 w-2 rounded-full", {
                "bg-red-500": status === CompetitionStatus.FINISHED,
                "bg-green-500": status === CompetitionStatus.ONGOING,
                "bg-yellow-500": status === CompetitionStatus.UPCOMING,
              })}
            />
          )}
          {status ? CompetitionStatusProps[status].name : "Status"}
        </div>
      </ComboboxButton>
      <ComboboxContent className="w-full">
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Status">
            <ComboboxItem value="ongoing">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Ongoing
            </ComboboxItem>
            <ComboboxItem value="upcoming">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              Upcoming
            </ComboboxItem>
            <ComboboxItem value="finished">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              Finished
            </ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

interface TypeSelectProps {
  type: CompetitionType | undefined;
  onTypeSelected: (type: CompetitionType | undefined) => void;
}

function TypeSelect(props: TypeSelectProps) {
  const { type, onTypeSelected } = props;

  return (
    <Combobox
      value={type}
      onValueChanged={(val) => {
        if (val === undefined || isCompetitionType(val)) {
          onTypeSelected(val);
        }
      }}
    >
      <ComboboxButton className="py-5">
        <div className={cn("flex items-center gap-x-2", !type && "text-gray-300")}>
          {type ? CompetitionTypeProps[type].name : "Competition type"}
        </div>
      </ComboboxButton>
      <ComboboxContent className="w-full">
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Type">
            <ComboboxItem value="classic">Classic</ComboboxItem>
            <ComboboxItem value="team">Team</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

function MetricIcon(props: { metric: Metric | "ehp+ehb" }) {
  const { metric } = props;
  return <Image width={16} height={16} alt={metric} src={`/img/metrics_small/${metric}.png`} />;
}
