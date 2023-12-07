import { GroupSocialLinks } from '../../server/src/prisma';
import {
  PlayerDeltasArray,
  PlayerDeltasMap,
  Country,
  Metric,
  Period,
  Player,
  PlayerBuild,
  PlayerType,
  EfficiencyAlgorithmType,
  NameChangeStatus,
  CompetitionStatus,
  CompetitionType,
  CompetitionWithParticipations,
  Team,
  GroupRole,
  GroupDetails,
  CompetitionCSVTableType
} from '../../server/src/utils';

export interface GenericCountMessageResponse {
  count: number;
  message: string;
}

export interface GenericMessageResponse {
  message: string;
}

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
 * Groups Client Types
 */

export interface GroupMemberFragment {
  username: string;
  role?: GroupRole;
}

export interface CreateGroupPayload {
  name: string;
  clanChat?: string;
  homeworld?: number;
  description?: string;
  members: Array<GroupMemberFragment>;
}

export type EditGroupPayload = Partial<CreateGroupPayload> & {
  bannerImage?: string;
  profileImage?: string;
  socialLinks?: Partial<GroupSocialLinks>;
};

export interface CreateGroupResponse {
  group: GroupDetails;
  verificationCode: string;
}

export type ChangeMemberRolePayload = Required<GroupMemberFragment>;

export type GetGroupGainsFilter = { metric: Metric } & TimeRangeFilter;

export interface GroupRecordsFilter {
  metric: Metric;
  period: Period;
}

/**
 * Competitions Client Types
 */

export interface CompetitionsSearchFilter {
  title?: string;
  metric?: Metric;
  type?: CompetitionType;
  status?: CompetitionStatus;
}

export type CompetitionDetailsCSVParams = {
  previewMetric?: Metric;
  teamName?: string;
  table?: CompetitionCSVTableType;
};

export type CreateCompetitionPayload = {
  title: string;
  metric: Metric;
  startsAt: Date;
  endsAt: Date;
  groupId?: number;
  groupVerificationCode?: string;
} & (
  | {
      participants: string[];
    }
  | {
      teams: Team[];
    }
);

export type EditCompetitionPayload = {
  title?: string;
  metric?: Metric;
  startsAt?: Date;
  endsAt?: Date;
  participants?: string[];
  teams?: Team[];
};

export type CreateCompetitionResponse = {
  competition: CompetitionWithParticipations;
  verificationCode: string;
};

/**
 * Name Changes Client Types
 */

export type NameChangesSearchFilter = {
  username?: string;
  status?: NameChangeStatus;
};

/**
 * Record Client Types
 */

export interface RecordLeaderboardFilter extends BasePlayerFilter {
  metric: Metric;
  period: Period;
}

/**
 * Player Client Types
 */

export interface PlayerCompetitionsFilter {
  status?: CompetitionStatus;
}

export interface PlayerCompetitionStandingsFilter {
  status: Exclude<CompetitionStatus, CompetitionStatus.UPCOMING>;
}

export interface PlayerRecordsFilter {
  period: Period | string;
  metric: Metric;
}

export interface AssertPlayerTypeResponse {
  player: Player;
  changed: boolean;
}

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

/**
 * Delta Client Types
 */

export interface DeltaLeaderboardFilter extends BasePlayerFilter {
  metric: Metric;
  period: Period | string;
}
