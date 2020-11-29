import { mapValues } from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.records;
const playerRecordsSelector = state => state.records.playerRecords;
const groupRecordsSelector = state => state.records.groupRecords;
const leaderboardsSelector = state => state.records.leaderboards;

const getPlayerRecordsMap = createSelector(playerRecordsSelector, map => map);

const getGroupRecordsMap = createSelector(groupRecordsSelector, map => {
  // Add a "rank" field to each row
  return mapValues(map, hiscores => hiscores.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const isFetching6h = createSelector(rootSelector, root => root.isFetchingLeaderboards['6h']);
export const isFetchingDay = createSelector(rootSelector, root => root.isFetchingLeaderboards.day);
export const isFetchingWeek = createSelector(rootSelector, root => root.isFetchingLeaderboards.week);
export const isFetchingMonth = createSelector(rootSelector, root => root.isFetchingLeaderboards.month);

export const isFetchingGroupRecords = createSelector(rootSelector, root => root.isFetchingGroupRecords);

export const getLeaderboards = createSelector(leaderboardsSelector, map => {
  // Add a "rank" field to each record of each period
  return mapValues(map, records => records && records.map((r, i) => ({ ...r, rank: i + 1 })));
});

export const getPlayerRecords = (state, username) => getPlayerRecordsMap(state)[username];
export const getGroupRecords = (state, groupId) => getGroupRecordsMap(state)[groupId];
