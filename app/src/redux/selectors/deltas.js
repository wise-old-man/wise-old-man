import _ from 'lodash';
import { createSelector } from 'reselect';

const deltasSelector = state => state.deltas;

export const isFetchingAll = createSelector(
  deltasSelector,
  leaderboard => leaderboard.isFetchingLeaderboard
);

export const getLeaderboard = createSelector(deltasSelector, ({ leaderboard }) => {
  // Add a "rank" field to each delta of each period
  return _.mapValues(leaderboard, deltas => deltas.map((d, i) => ({ ...d, rank: i + 1 })));
});

export const getDeltasMap = createSelector(deltasSelector, ({ deltas }) => {
  return deltas;
});

export const getDeltas = createSelector(deltasSelector, ({ deltas }) => {
  return Object.values(deltas);
});

export const getPlayerDeltas = (state, playerId) => {
  return getDeltasMap(state)[playerId];
};
