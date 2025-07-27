/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { GroupMetricLeadersResponse } from './group-metric-leaders.response';
import { SnapshotResponse } from './snapshot.response';

export interface GroupStatisticsResponse {
  maxedCombatCount: number;
  maxedTotalCount: number;
  maxed200msCount: number;
  averageStats: SnapshotResponse;
  metricLeaders: GroupMetricLeadersResponse;
}
