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

export const isFetching = period => {
  return createSelector(rootSelector, root => root.isFetchingLeaderboards[period]);
};

export const getLeaderboards = period => {
  return createSelector(leaderboardsSelector, map => {
    // Add a "rank" field to each delta of each period
    return mapValues(map, deltas => deltas && deltas.map((d, i) => ({ ...d, rank: i + 1 })))[period];
  });
};

export const isFetchingGroupDeltas = createSelector(rootSelector, root => root.isFetchingGroupDeltas);
export const isFetchingPlayerDeltas = createSelector(rootSelector, root => root.isFetchingPlayerDeltas);

export function getPlayerDeltas(username) {
  return state => getPlayerDeltasMap(state)[username];
}

export function getGroupDeltas(groupId) {
  return state => getGroupDeltasMap(state)[groupId];
}
