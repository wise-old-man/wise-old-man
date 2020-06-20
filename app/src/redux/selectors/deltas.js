import _ from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.deltas;
const leaderboardSelector = state => state.deltas.leaderboard;
const playerDeltasSelector = state => state.deltas.playerDeltas;
const groupDeltasSelector = state => state.deltas.groupDeltas;

const getPlayerDeltasMap = createSelector(playerDeltasSelector, map => map);

const getGroupDeltasMap = createSelector(groupDeltasSelector, map => {
  // Add a "rank" and "percentage" fields to each row
  return _.mapValues(map, hiscores =>
    hiscores.map((d, i) => {
      return { ...d, rank: i + 1, percentage: d.startValue === 0 ? 1 : d.gained / d.startValue };
    })
  );
});

export const isFetchingLeaderboard = createSelector(rootSelector, root => root.isFetchingLeaderboard);
export const isFetchingGroupDeltas = createSelector(rootSelector, root => root.isFetchingGroupDeltas);

export const getLeaderboard = createSelector(leaderboardSelector, map => {
  // Add a "rank" field to each delta of each period
  return _.mapValues(map, deltas => deltas.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const getPlayerDeltas = (state, playerId) => getPlayerDeltasMap(state)[playerId];
export const getGroupDeltas = (state, groupId) => getGroupDeltasMap(state)[groupId];
