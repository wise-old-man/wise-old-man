import _ from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.records;
const recordsSelector = state => state.records.records;
const leaderboardSelector = state => state.records.leaderboard;

export const isFetchingLeaderboard = createSelector(rootSelector, root => root.isFetchingLeaderboard);

export const getLeaderboard = createSelector(leaderboardSelector, map => {
  // Add a "rank" field to each record of each period
  return _.mapValues(map, records => records.map((r, i) => ({ ...r, rank: i + 1 })));
});

export const getRecordsMap = createSelector(recordsSelector, map => map);

export const getRecords = createSelector(recordsSelector, map => Object.values(map));

export const getPlayerRecords = (state, playerId) => getRecordsMap(state)[playerId];
