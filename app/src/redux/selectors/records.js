import _ from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.records;
const playerRecordsSelector = state => state.records.playerRecords;
const groupRecordsSelector = state => state.records.groupRecords;
const leaderboardSelector = state => state.records.leaderboard;

const getPlayerRecordsMap = createSelector(playerRecordsSelector, map => map);

const getGroupRecordsMap = createSelector(groupRecordsSelector, map => {
  // Add a "rank" field to each row
  return _.mapValues(map, hiscores => hiscores.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const isFetchingLeaderboard = createSelector(rootSelector, root => root.isFetchingLeaderboard);
export const isFetchingGroupRecords = createSelector(rootSelector, root => root.isFetchingGroupRecords);

export const getLeaderboard = createSelector(leaderboardSelector, map => {
  // Add a "rank" field to each record of each period
  return _.mapValues(map, records => records.map((r, i) => ({ ...r, rank: i + 1 })));
});

export const getPlayerRecords = (state, playerId) => getPlayerRecordsMap(state)[playerId];
export const getGroupRecords = (state, groupId) => getGroupRecordsMap(state)[groupId];
