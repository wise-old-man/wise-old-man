import { createSelector } from 'reselect';

const rootSelector = state => state.leaderboards;
const leaderboardsSelector = state => state.leaderboards.leaderboards;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetchingAll = createSelector(rootSelector, root => root.isFetchingLeaderboards);

export const getLeaderboards = createSelector(leaderboardsSelector, array => {
  return array.map((item, i) => ({ ...item, rank: i + 1 }));
});
