import {
  AchievementProgress,
  ExtendedAchievement,
  FormattedSnapshot,
  MembershipWithGroup,
  Record,
  NameChange,
  ParticipationWithCompetition,
  PlayerDeltasArray,
  PlayerDeltasMap,
  PlayerDetails,
  Country,
  Metric,
  Period,
  Player,
  PlayerBuild,
  PlayerType,
  EfficiencyAlgorithmType,
  NameChangeStatus,
  NameChangeDetails
} from '../../server/src/utils';

export type TimeRangeFilter =
  | {
      period: Period | string;
    }
  | {
      startDate: Date;
      endDate: Date;
    };

interface BasePlayerFilter {
  country?: Country;
  playerType?: PlayerType;
  playerBuild?: PlayerBuild;
}

/**
 * Name Changes Client Types
 */

export type NameChangesFilter = {
  username?: string;
  status?: NameChangeStatus;
};

export type SearchNameChangesResponse = NameChange[];

export type SubmitNameChangeResponse = NameChange;

export type GetNameChangeDetailsResponse = NameChangeDetails;

/**
 * Record Client Types
 */

export interface RecordLeaderboardFilter extends BasePlayerFilter {
  metric: Metric;
  period: Period | string;
}

export type GetRecordLeaderboardResponse = Array<Record & { player: Player }>;

/**
 * Player Client Types
 */

export interface PlayerRecordsFilter {
  period: Period | string;
  metric: Metric;
}

export interface AssertPlayerTypeResponse {
  player: Player;
  changed: boolean;
}

export interface ImportPlayerResponse {
  count: number;
  message: string;
}

export type SearchPlayersResponse = Player[];

export type UpdatePlayerResponse = PlayerDetails;

export type GetPlayerDetailsResponse = PlayerDetails;

export type GetPlayerAchievementsResponse = ExtendedAchievement[];

export type GetPlayerAchievementProgressResponse = AchievementProgress[];

export type GetPlayerCompetitionsResponse = ParticipationWithCompetition[];

export type GetPlayerGroupsResponse = MembershipWithGroup[];

export type GetPlayerRecordsResponse = Record[];

export type GetPlayerNamesResponse = NameChange[];

export type GetPlayerSnapshotsResponse = FormattedSnapshot[];

export type GetPlayerGainsResponse<T extends PlayerDeltasArray | PlayerDeltasMap> = {
  startsAt: Date;
  endsAt: Date;
  data: T;
};

/**
 * Efficiency Client Types
 */

export type EfficiencyAlgorithmTypeUnion = `${EfficiencyAlgorithmType}`;

export interface EfficiencyLeaderboardsFilter extends BasePlayerFilter {
  metric: typeof Metric.EHP | typeof Metric.EHB | 'ehp+ehb';
}

export type GetEfficiencyLeaderboardsResponse = Player[];

/**
 * Delta Client Types
 */

export interface DeltaLeaderboardFilter extends BasePlayerFilter {
  metric: Metric;
  period: Period | string;
}

export type GetDeltaLeaderboardResponse = Array<{
  startDate: Date;
  endDate: Date;
  gained: number;
  player: Player;
}>;
