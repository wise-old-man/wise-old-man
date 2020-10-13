import _ from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.deltas;
const leaderboardsSelector = state => state.deltas.leaderboards;
const playerDeltasSelector = state => state.deltas.playerDeltas;
const groupDeltasSelector = state => state.deltas.groupDeltas;

const getPlayerDeltasMap = createSelector(playerDeltasSelector, map => map);

const getGroupDeltasMap = createSelector(groupDeltasSelector, map => {
  // Add a "rank" field to each row
  return _.mapValues(map, hiscores => hiscores.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const isFetchingDay = createSelector(rootSelector, root => root.isFetching.day);
export const isFetchingWeek = createSelector(rootSelector, root => root.isFetching.week);
export const isFetchingMonth = createSelector(rootSelector, root => root.isFetching.month);

export const isFetchingGroupDeltas = createSelector(rootSelector, root => root.isFetchingGroupDeltas);

export const getLeaderboards = createSelector(leaderboardsSelector, map => {
  // Add a "rank" field to each delta of each period
  return _.mapValues(map, deltas => deltas && deltas.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const getPlayerDeltas = (state, username) => getPlayerDeltasMap(state)[username];
export const getGroupDeltas = (state, groupId) => getGroupDeltasMap(state)[groupId];
