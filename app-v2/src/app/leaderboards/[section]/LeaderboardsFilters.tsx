"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  BOSSES,
  COUNTRY_CODES,
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
import { cn } from "~/utils";

interface LeaderboardsFiltersProps {
  metric: Metric;
  playerType: PlayerType | undefined;
  playerBuild: PlayerBuild | undefined;
  country: Country | undefined;
}

export function LeaderboardsFilters(props: LeaderboardsFiltersProps) {
  const { metric, playerType, playerBuild, country } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      <MetricSelect
        metric={metric}
        onMetricSelected={(newMetric) => handleParamChanged("metric", newMetric)}
      />
      <PlayerTypeSelect
        playerType={playerType}
        onPlayerTypeSelected={(newPlayerType) => handleParamChanged("playerType", newPlayerType)}
      />
      <PlayerBuildSelect
        playerBuild={playerBuild}
        onPlayerBuildSelected={(newPlayerBuild) => handleParamChanged("playerBuild", newPlayerBuild)}
      />
      <CountrySelect
        country={country}
        onCountrySelected={(newCountry) => handleParamChanged("country", newCountry)}
      />
    </>
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
          <span className="line-clamp-1">{MetricProps[metric].name} </span>
        </div>
      </SelectButton>
      <SelectContent align="end" className="w-[16rem]">
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
      <SelectContent align="end">
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
      <SelectContent align="end">
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
          <span className="line-clamp-1"> {country ? CountryProps[country].name : "Country"}</span>
        </div>
      </SelectButton>
      <SelectContent align="end" className="w-[20rem]">
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

function MetricIcon(props: { metric: Metric }) {
  const { metric } = props;
  return (
    <Image
      width={16}
      height={16}
      alt={metric}
      src={`https://wiseoldman.net/img/runescape/icons_small/${metric}.png`}
    />
  );
}

function PlayerTypeIcon(props: { playerType: PlayerType }) {
  const { playerType } = props;
  return (
    <Image
      width={10}
      height={13}
      alt={playerType}
      src={`https://wiseoldman.net/img/runescape/icons_small/${playerType}.png`}
    />
  );
}

function CountryIcon(props: { country: Country }) {
  const { country } = props;
  return (
    <Image
      width={16}
      height={16}
      alt={country}
      src={`https://wiseoldman.net/img/flags/${country}.svg`}
    />
  );
}
