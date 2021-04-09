import { createSelector } from 'reselect';

const rootSelector = state => state.snapshots;
const snapshotsSelector = state => state.snapshots.snapshots;
const getSnapshotsMap = createSelector(snapshotsSelector, map => map);

export const getPlayerSnapshots = (state, username) => getSnapshotsMap(state)[username];

export const isFetchingPlayerSnapshots = createSelector(rootSelector, root => root.isFetching);
