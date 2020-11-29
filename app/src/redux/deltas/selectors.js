import { mapValues } from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.deltas;
const leaderboardsSelector = state => state.deltas.leaderboards;
const playerDeltasSelector = state => state.deltas.playerDeltas;
const groupDeltasSelector = state => state.deltas.groupDeltas;

const getPlayerDeltasMap = createSelector(playerDeltasSelector, map => map);

const getGroupDeltasMap = createSelector(groupDeltasSelector, map => {
  // Add a "rank" field to each row
  return mapValues(map, hiscores => hiscores.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const isFetching6h = createSelector(rootSelector, root => root.isFetchingLeaderboards['6h']);
export const isFetchingDay = createSelector(rootSelector, root => root.isFetchingLeaderboards.day);
export const isFetchingWeek = createSelector(rootSelector, root => root.isFetchingLeaderboards.week);
export const isFetchingMonth = createSelector(rootSelector, root => root.isFetchingLeaderboards.month);
export const isFetchingYear = createSelector(rootSelector, root => root.isFetchingLeaderboards.year);

export const isFetchingGroupDeltas = createSelector(rootSelector, root => root.isFetchingGroupDeltas);

export const getLeaderboards = createSelector(leaderboardsSelector, map => {
  // Add a "rank" field to each delta of each period
  return mapValues(map, deltas => deltas && deltas.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const getPlayerDeltas = (state, username) => getPlayerDeltasMap(state)[username];
export const getGroupDeltas = (state, groupId) => getGroupDeltasMap(state)[groupId];
