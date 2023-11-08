"use client";

import Image from "next/image";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  COUNTRY_CODES,
  ComputedMetric,
  Country,
  CountryProps,
  Metric,
  MetricProps,
  PLAYER_BUILDS,
  PlayerBuild,
  PlayerBuildProps,
  SKILLS,
  isComputedMetric,
  isCountry,
  isMetric,
  isPlayerBuild,
} from "@wise-old-man/utils";
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
} from "~/components/Combobox";
import { cn } from "~/utils/styling";
import {
  getComputedMetricParam,
  getCountryParam,
  getMetricParam,
  getPlayerBuildParam,
} from "~/utils/params";
import { MetricIconSmall } from "../Icon";

export function LeaderboardsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isEfficiencyLeaderboard = pathname.includes("efficiency");

  const metric = getMetricParam(searchParams.get("metric")) || Metric.OVERALL;
  const country = getCountryParam(searchParams.get("country"));

  let playerBuild = getPlayerBuildParam(searchParams.get("playerBuild"));

  if (isEfficiencyLeaderboard) {
    if (!playerBuild) playerBuild = PlayerBuild.MAIN;
  }

  // For efficiency leaderboards (it only accepts "ehp"/"ehb/"combined")
  const computedMetric = getComputedMetricParam(searchParams.get("metric")) || Metric.EHP;

  function handleParamChanged(paramName: string, paramValue: string | undefined) {
    const nextParams = new URLSearchParams(searchParams);

    if (paramValue) {
      nextParams.set(paramName, paramValue);
    } else {
      nextParams.delete(paramName);
    }

    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {isEfficiencyLeaderboard ? (
        <ComputedMetricSelect
          metric={computedMetric}
          onMetricSelected={(newMetric) => handleParamChanged("metric", newMetric)}
        />
      ) : (
        <MetricSelect
          metric={metric}
          onMetricSelected={(newMetric) => handleParamChanged("metric", newMetric)}
        />
      )}
      <PlayerBuildSelect
        playerBuild={playerBuild}
        onPlayerBuildSelected={(newPlayerBuild) => handleParamChanged("playerBuild", newPlayerBuild)}
      />
      <CountrySelect
        country={country}
        onCountrySelected={(newCountry) => handleParamChanged("country", newCountry)}
      />
    </div>
  );
}

interface ComputedMetricSelectProps {
  metric: ComputedMetric | "combined";
  onMetricSelected: (metric: ComputedMetric | "combined") => void;
}

function ComputedMetricSelect(props: ComputedMetricSelectProps) {
  const { metric, onMetricSelected } = props;

  const [isTransitioning, startTransition] = useTransition();

  return (
    <Combobox
      value={metric}
      onValueChanged={(val) => {
        startTransition(() => {
          if (val === undefined) {
            onMetricSelected(Metric.EHP);
          } else if (val === "combined" || isComputedMetric(val)) {
            onMetricSelected(val);
          }
        });
      }}
    >
      <ComboboxButton className="w-full" isPending={isTransitioning}>
        <div className="flex items-center gap-x-2">
          {metric === "combined" ? (
            <>
              <MetricIconSmall metric="ehp+ehb" />
              <span className="line-clamp-1 text-left">EHP + EHB</span>
            </>
          ) : (
            <>
              <MetricIconSmall metric={metric} />
              <span className="line-clamp-1 text-left">{MetricProps[metric].name}</span>
            </>
          )}
        </div>
      </ComboboxButton>
      <ComboboxContent className="w-64">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            {COMPUTED_METRICS.map((computed) => (
              <ComboboxItem key={computed} value={computed}>
                <MetricIconSmall metric={computed} />
                {MetricProps[computed].name}
              </ComboboxItem>
            ))}
            <ComboboxItem value="combined">
              <MetricIconSmall metric="ehp+ehb" />
              EHP + EHB
            </ComboboxItem>
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

  const [isTransitioning, startTransition] = useTransition();

  return (
    <Combobox
      value={metric}
      onValueChanged={(val) => {
        startTransition(() => {
          if (val === undefined) {
            onMetricSelected(Metric.OVERALL);
          } else if (isMetric(val)) {
            onMetricSelected(val);
          }
        });
      }}
    >
      <ComboboxButton isPending={isTransitioning}>
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

interface PlayerBuildSelectProps {
  playerBuild: PlayerBuild | undefined;
  onPlayerBuildSelected: (playerBuild: PlayerBuild | undefined) => void;
}

function PlayerBuildSelect(props: PlayerBuildSelectProps) {
  const { playerBuild, onPlayerBuildSelected } = props;

  const [isTransitioning, startTransition] = useTransition();

  return (
    <Combobox
      value={playerBuild}
      onValueChanged={(val) => {
        if (val === undefined || isPlayerBuild(val)) {
          startTransition(() => {
            onPlayerBuildSelected(val);
          });
        }
      }}
    >
      <ComboboxButton className="w-full" isPending={isTransitioning}>
        <div className={cn("flex items-center gap-x-2", !playerBuild && "text-gray-200")}>
          {playerBuild ? PlayerBuildProps[playerBuild].name : "Player Build"}
        </div>
      </ComboboxButton>
      <ComboboxContent>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Player Build">
            <ComboboxItem>Any player build</ComboboxItem>
            {PLAYER_BUILDS.map((b) => (
              <ComboboxItem key={b} value={b}>
                {PlayerBuildProps[b].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

interface CountrySelectProps {
  country: Country | undefined;
  onCountrySelected: (country: Country | undefined) => void;
}

function CountrySelect(props: CountrySelectProps) {
  const { country, onCountrySelected } = props;

  const [isTransitioning, startTransition] = useTransition();

  return (
    <Combobox
      value={country}
      onValueChanged={(val) => {
        startTransition(() => {
          if (!val) return onCountrySelected(undefined);

          const [code] = val.split("_");
          if (code && isCountry(code)) onCountrySelected(code);
        });
      }}
    >
      <ComboboxButton isPending={isTransitioning}>
        <div className={cn("flex items-center gap-x-2", !country && "text-gray-200")}>
          {country && <CountryIcon country={country} />}
          <span className="line-clamp-1 text-left">
            {country ? CountryProps[country].name : "Country"}
          </span>
        </div>
      </ComboboxButton>
      <ComboboxContent className="w-80" align="end">
        <ComboboxInput placeholder="Search countries..." />
        <ComboboxEmpty>No results were found</ComboboxEmpty>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Countries">
            <ComboboxItem>Any country</ComboboxItem>
            {COUNTRY_CODES.map((c) => (
              <ComboboxItem key={c} value={`${c}_${CountryProps[c].name}`}>
                <CountryIcon country={c} />
                <span className="line-clamp-1">{CountryProps[c].name}</span>
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

function CountryIcon(props: { country: Country }) {
  const { country } = props;
  return <Image width={12} height={12} alt={country} src={`/img/flags/${country}.svg`} />;
}
