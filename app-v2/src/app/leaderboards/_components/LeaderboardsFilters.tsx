"use client";

import Image from "next/image";
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
  PLAYER_TYPES,
  PlayerBuild,
  PlayerBuildProps,
  PlayerType,
  PlayerTypeProps,
  SKILLS,
} from "@wise-old-man/utils";
import {
  Select,
  SelectButton,
  SelectContent,
  SelectEmpty,
  SelectInput,
  SelectItem,
  SelectItemGroup,
  SelectItemsContainer,
  SelectSeparator,
} from "~/components/Select";
import { cn } from "~/utils/styling";
import {
  getComputedMetricParam,
  getCountryParam,
  getMetricParam,
  getPlayerBuildParam,
  getPlayerTypeParam,
} from "~/utils/params";

export function LeaderboardsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isEfficiencyLeaderboard = pathname.includes("efficiency");

  const metric = getMetricParam(searchParams.get("metric")) || Metric.OVERALL;
  const country = getCountryParam(searchParams.get("country"));
  const playerType = getPlayerTypeParam(searchParams.get("playerType"));
  const playerBuild = getPlayerBuildParam(searchParams.get("playerBuild"));

  // For efficiency leaderboards (it only accepts "ehp"/"ehb/"combined")
  const computedMetric = getComputedMetricParam(searchParams.get("metric")) || Metric.EHP;

  function handleParamChanged(paramName: string, paramValue: string | undefined) {
    const nextParams = new URLSearchParams(searchParams);

    if (paramValue) {
      nextParams.set(paramName, paramValue);
    } else {
      nextParams.delete(paramName);
    }

    router.push(`${pathname}?${nextParams.toString()}`);
  }

  return (
    <>
      {isEfficiencyLeaderboard ? (
        <ComputedMetricSelect
          key={computedMetric}
          metric={computedMetric}
          onMetricSelected={(newMetric) => handleParamChanged("metric", newMetric)}
        />
      ) : (
        <MetricSelect
          key={metric}
          metric={metric}
          onMetricSelected={(newMetric) => handleParamChanged("metric", newMetric)}
        />
      )}
      <PlayerTypeSelect
        key={playerType}
        playerType={playerType}
        onPlayerTypeSelected={(newPlayerType) => handleParamChanged("playerType", newPlayerType)}
      />
      <PlayerBuildSelect
        key={playerBuild}
        playerBuild={playerBuild}
        onPlayerBuildSelected={(newPlayerBuild) => handleParamChanged("playerBuild", newPlayerBuild)}
      />
      <CountrySelect
        key={country}
        country={country}
        onCountrySelected={(newCountry) => handleParamChanged("country", newCountry)}
      />
    </>
  );
}

interface ComputedMetricSelectProps {
  metric: ComputedMetric | "combined";
  onMetricSelected: (metric: ComputedMetric | "combined") => void;
}

function ComputedMetricSelect(props: ComputedMetricSelectProps) {
  const { metric, onMetricSelected } = props;

  return (
    <Select>
      <SelectButton className="w-full">
        <div className="flex items-center gap-x-2">
          {metric === "combined" ? (
            <>
              <MetricIcon metric="ehp+ehb" />
              <span className="line-clamp-1 text-left">EHP + EHB</span>
            </>
          ) : (
            <>
              <MetricIcon metric={metric} />
              <span className="line-clamp-1 text-left">{MetricProps[metric].name}</span>
            </>
          )}
        </div>
      </SelectButton>
      <SelectContent className="w-64">
        <SelectItemsContainer>
          <SelectItemGroup>
            {COMPUTED_METRICS.map((computed) => (
              <SelectItem
                key={computed}
                value={MetricProps[computed].name}
                selected={computed === metric}
                onSelect={() => onMetricSelected(computed)}
              >
                <MetricIcon metric={computed} />
                {MetricProps[computed].name}
              </SelectItem>
            ))}
            <SelectItem
              value="combined"
              selected={metric === "combined"}
              onSelect={() => onMetricSelected("combined")}
            >
              <MetricIcon metric="ehp+ehb" />
              EHP + EHB
            </SelectItem>
          </SelectItemGroup>
        </SelectItemsContainer>
      </SelectContent>
    </Select>
  );
}

interface MetricSelectProps {
  metric: Metric;
  onMetricSelected: (metric: Metric) => void;
}

function MetricSelect(props: MetricSelectProps) {
  const { metric, onMetricSelected } = props;

  return (
    <Select>
      <SelectButton className="w-full">
        <div className="flex items-center gap-x-2">
          <MetricIcon metric={metric} />
          <span className="line-clamp-1 text-left">{MetricProps[metric].name} </span>
        </div>
      </SelectButton>
      <SelectContent className="w-64">
        <SelectInput placeholder="Search metrics..." />
        <SelectEmpty>No results were found</SelectEmpty>
        <SelectItemsContainer>
          <SelectItemGroup label="Skills">
            {SKILLS.map((skill) => (
              <SelectItem
                key={skill}
                value={MetricProps[skill].name}
                selected={skill === metric}
                onSelect={() => onMetricSelected(skill)}
              >
                <MetricIcon metric={skill} />
                {MetricProps[skill].name}
              </SelectItem>
            ))}
          </SelectItemGroup>
          <SelectSeparator />
          <SelectItemGroup label="Bosses">
            {BOSSES.map((boss) => (
              <SelectItem
                key={boss}
                value={MetricProps[boss].name}
                selected={boss === metric}
                onSelect={() => onMetricSelected(boss)}
              >
                <MetricIcon metric={boss} />
                {MetricProps[boss].name}
              </SelectItem>
            ))}
          </SelectItemGroup>
          <SelectSeparator />
          <SelectItemGroup label="Activities">
            {ACTIVITIES.map((activity) => (
              <SelectItem
                key={activity}
                value={MetricProps[activity].name}
                selected={activity === metric}
                onSelect={() => onMetricSelected(activity)}
              >
                <MetricIcon metric={activity} />
                {MetricProps[activity].name}
              </SelectItem>
            ))}
          </SelectItemGroup>
          <SelectItemGroup label="Computed">
            {COMPUTED_METRICS.map((computed) => (
              <SelectItem
                key={computed}
                value={MetricProps[computed].name}
                selected={computed === metric}
                onSelect={() => onMetricSelected(computed)}
              >
                <MetricIcon metric={computed} />
                {MetricProps[computed].name}
              </SelectItem>
            ))}
          </SelectItemGroup>
        </SelectItemsContainer>
      </SelectContent>
    </Select>
  );
}

interface PlayerTypeSelectProps {
  playerType: PlayerType | undefined;
  onPlayerTypeSelected: (playerType: PlayerType | undefined) => void;
}

function PlayerTypeSelect(props: PlayerTypeSelectProps) {
  const { onPlayerTypeSelected, playerType } = props;

  return (
    <Select>
      <SelectButton className="w-full">
        <div className={cn("flex items-center gap-x-2", !playerType && "text-gray-300")}>
          {playerType && <PlayerTypeIcon playerType={playerType} />}
          {playerType ? PlayerTypeProps[playerType].name : "Player Type"}
        </div>
      </SelectButton>
      <SelectContent>
        <SelectItemsContainer>
          <SelectItemGroup label="Player Type">
            <SelectItem selected={!playerType} onSelect={() => onPlayerTypeSelected(undefined)}>
              Any player type
            </SelectItem>
            {PLAYER_TYPES.filter((type) => type !== PlayerType.UNKNOWN).map((t) => (
              <SelectItem
                key={t}
                value={t}
                selected={t === playerType}
                onSelect={() => onPlayerTypeSelected(t)}
              >
                <PlayerTypeIcon playerType={t} />
                {PlayerTypeProps[t].name}
              </SelectItem>
            ))}
          </SelectItemGroup>
        </SelectItemsContainer>
      </SelectContent>
    </Select>
  );
}

interface PlayerBuildSelectProps {
  playerBuild: PlayerBuild | undefined;
  onPlayerBuildSelected: (playerBuild: PlayerBuild | undefined) => void;
}

function PlayerBuildSelect(props: PlayerBuildSelectProps) {
  const { onPlayerBuildSelected, playerBuild } = props;

  return (
    <Select>
      <SelectButton className="w-full">
        <div className={cn("flex items-center gap-x-2", !playerBuild && "text-gray-300")}>
          {playerBuild ? PlayerBuildProps[playerBuild].name : "Player Build"}
        </div>
      </SelectButton>
      <SelectContent>
        <SelectItemsContainer>
          <SelectItemGroup label="Player Build">
            <SelectItem selected={!playerBuild} onSelect={() => onPlayerBuildSelected(undefined)}>
              Any player Build
            </SelectItem>
            {PLAYER_BUILDS.map((b) => (
              <SelectItem
                key={b}
                value={b}
                selected={b === playerBuild}
                onSelect={() => onPlayerBuildSelected(b)}
              >
                {PlayerBuildProps[b].name}
              </SelectItem>
            ))}
          </SelectItemGroup>
        </SelectItemsContainer>
      </SelectContent>
    </Select>
  );
}

interface CountrySelectProps {
  country: Country | undefined;
  onCountrySelected: (country: Country | undefined) => void;
}

function CountrySelect(props: CountrySelectProps) {
  const { country, onCountrySelected } = props;

  return (
    <Select>
      <SelectButton className="w-full">
        <div className={cn("flex items-center gap-x-2", !country && "text-gray-300")}>
          {country && <CountryIcon country={country} />}
          <span className="line-clamp-1 text-left">
            {country ? CountryProps[country].name : "Country"}
          </span>
        </div>
      </SelectButton>
      <SelectContent className="w-80" align="end">
        <SelectInput placeholder="Search countries..." />
        <SelectEmpty>No results were found</SelectEmpty>
        <SelectItemsContainer>
          <SelectItemGroup label="Countries">
            <SelectItem selected={!country} onSelect={() => onCountrySelected(undefined)}>
              Any country
            </SelectItem>
            {COUNTRY_CODES.map((c) => (
              <SelectItem
                key={c}
                value={CountryProps[c].name}
                selected={c === country}
                onSelect={() => onCountrySelected(c)}
              >
                <CountryIcon country={c} />
                <span className="line-clamp-1">{CountryProps[c].name}</span>
              </SelectItem>
            ))}
          </SelectItemGroup>
        </SelectItemsContainer>
      </SelectContent>
    </Select>
  );
}

function MetricIcon(props: { metric: Metric | "ehp+ehb" }) {
  const { metric } = props;
  return <Image width={16} height={16} alt={metric} src={`/img/metrics_small/${metric}.png`} />;
}

function PlayerTypeIcon(props: { playerType: PlayerType }) {
  const { playerType } = props;
  return <Image width={10} height={13} alt={playerType} src={`/img/player_types/${playerType}.png`} />;
}

function CountryIcon(props: { country: Country }) {
  const { country } = props;
  return <Image width={12} height={12} alt={country} src={`/img/flags/${country}.svg`} />;
}
