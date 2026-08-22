import { CompetitionTeam, GroupRole, Metric, Period } from '../../server/src/types';

export {
  AchievementProgressResponse,
  AchievementResponse,
  CompetitionDetailsResponse,
  CompetitionResponse,
  GroupDetailsResponse,
  GroupHiscoresEntryResponse,
  GroupResponse,
  GroupStatisticsResponse,
  MemberActivityResponse,
  MembershipResponse,
  NameChangeDetailsResponse,
  NameChangeResponse,
  ParticipantHistoryResponse,
  ParticipationResponse,
  PlayerArchiveResponse,
  PlayerCompetitionStandingResponse,
  PlayerDeltasMapResponse,
  PlayerDetailsResponse,
  PlayerResponse,
  RecordResponse,
  SnapshotResponse
} from '../../server/src/api/responses';

export * from '../../server/src/types';

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

export interface CreateGroupPayload {
  name: string;
  clanChat?: string;
  homeworld?: number;
  description?: string;
  members: Array<{
    username: string;
    role?: GroupRole;
  }>;
}

export type EditGroupPayload = Partial<CreateGroupPayload> & {
  bannerImage?: string;
  profileImage?: string;
  socialLinks?: Partial<{
    website?: string | null;
    discord?: string | null;
    twitter?: string | null;
    twitch?: string | null;
    youtube?: string | null;
  }>;
  roleOrders?: Array<{ role: GroupRole; index: number }>;
};

export type CreateCompetitionPayload = {
  title: string;
  /**
   * @deprecated Use `metrics` instead. Kept for backwards compatibility and will be removed in a
   * future version. When both are provided, `metrics` takes precedence. Equivalent to `metrics[0]`.
   */
  metric?: Metric;
  metrics?: Metric[];
  startsAt: Date;
  endsAt: Date;
  groupId?: number;
  groupVerificationCode?: string;
} & (
  | {
      participants: string[];
    }
  | {
      teams: CompetitionTeam[];
    }
);

export type EditCompetitionPayload = {
  title?: string;
  /**
   * @deprecated Use `metrics` instead. Kept for backwards compatibility and will be removed in a
   * future version. When both are provided, `metrics` takes precedence. Equivalent to `metrics[0]`.
   */
  metric?: Metric;
  metrics?: Metric[];
  startsAt?: Date;
  endsAt?: Date;
  participants?: string[];
  teams?: CompetitionTeam[];
};
