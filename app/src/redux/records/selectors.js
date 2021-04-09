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

export const isFetching = period => {
  return createSelector(rootSelector, root => root.isFetchingLeaderboards[period]);
};

export const getLeaderboards = period => {
  return createSelector(leaderboardsSelector, map => {
    // Add a "rank" field to each delta of each period
    return mapValues(map, deltas => deltas && deltas.map((d, i) => ({ ...d, rank: i + 1 })))[period];
  });
};

export const isFetchingGroupRecords = createSelector(rootSelector, root => root.isFetchingGroupRecords);
export const isFetchingPlayerRecords = createSelector(
  rootSelector,
  root => root.isFetchingPlayerRecords
);

export const getPlayerRecords = (state, username) => getPlayerRecordsMap(state)[username];
export const getGroupRecords = (state, groupId) => getGroupRecordsMap(state)[groupId];
