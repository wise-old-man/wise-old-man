"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "~/utils/styling";
import {
  getCompetitionStatusParam,
  getCompetitionTypeParam,
  getMetricParam,
  getSearchParam,
} from "~/utils/params";
import useDebounceCallback from "~/hooks/useDebouncedCallback";
import { Input } from "~/components/Input";
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
import { MetricIconSmall } from "../Icon";

import SearchIcon from "~/assets/search.svg";
import LoadingIcon from "~/assets/loading.svg";

export function CompetitionsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = getSearchParam(searchParams.get("search"));
  const metric = getMetricParam(searchParams.get("metric"));
  const type = getCompetitionTypeParam(searchParams.get("type"));
  const status = getCompetitionStatusParam(searchParams.get("status"));

  function handleParamChanged(paramName: string, paramValue: string | undefined) {
    const nextParams = new URLSearchParams(searchParams);

    // Reset pagination if params change
    nextParams.delete("page");

    if (paramValue) {
      nextParams.set(paramName, paramValue);
    } else {
      nextParams.delete(paramName);
    }

    router.replace(`/competitions?${nextParams.toString()}`, { scroll: false });
  }

  function handleSearchChanged(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    // Reset pagination if params change
    nextParams.delete("page");

    if (value.trim().length > 0) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    router.replace(`/competitions?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <SearchInput search={search} onSearchChanged={handleSearchChanged} />
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

interface SearchInputProps {
  search?: string;
  onSearchChanged: (search: string) => void;
}

function SearchInput(props: SearchInputProps) {
  const { search, onSearchChanged } = props;

  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search);

  const debouncedUrlUpdate = useDebounceCallback((val) => {
    startTransition(() => {
      onSearchChanged(val);
    });
  }, 500);

  return (
    <Input
      value={searchInput}
      placeholder="Search competitions..."
      className="border-gray-600"
      containerClassName="md:max-w-xs w-full"
      leftElement={<SearchIcon className="h-5 w-5 text-gray-300" />}
      rightElement={
        isPending ? <LoadingIcon className="h-5 w-5 animate-spin text-gray-400" /> : undefined
      }
      onChange={(e) => {
        setSearchInput(e.target.value);
        debouncedUrlUpdate(e.target.value);
      }}
    />
  );
}

interface MetricSelectProps {
  metric: Metric | undefined;
  onMetricSelected: (metric: Metric | undefined) => void;
}

function MetricSelect(props: MetricSelectProps) {
  const { metric, onMetricSelected } = props;

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={metric}
      onValueChanged={(val) => {
        if (val === undefined || isMetric(val)) {
          startTransition(() => {
            onMetricSelected(val);
          });
        }
      }}
    >
      <ComboboxButton className="py-5" isPending={isPending}>
        <div className={cn("flex items-center gap-x-2", !metric && "text-gray-200")}>
          {metric && <MetricIconSmall metric={metric} />}
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

interface StatusSelectProps {
  status: CompetitionStatus | undefined;
  onStatusSelected: (status: CompetitionStatus | undefined) => void;
}

function StatusSelect(props: StatusSelectProps) {
  const { status, onStatusSelected } = props;

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={status}
      onValueChanged={(val) => {
        if (val === undefined || isCompetitionStatus(val)) {
          startTransition(() => {
            onStatusSelected(val);
          });
        }
      }}
    >
      <ComboboxButton className="py-5" isPending={isPending}>
        <div className={cn("flex items-center gap-x-2", !status && "text-gray-200")}>
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

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={type}
      onValueChanged={(val) => {
        if (val === undefined || isCompetitionType(val)) {
          startTransition(() => {
            onTypeSelected(val);
          });
        }
      }}
    >
      <ComboboxButton className="py-5" isPending={isPending}>
        <div className={cn("flex items-center gap-x-2", !type && "text-gray-200")}>
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
