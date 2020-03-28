import _ from 'lodash';
import { createSelector } from 'reselect';

const recordsSelector = state => state.records;

export const getLeaderboard = createSelector(recordsSelector, ({ leaderboard }) => {
  // Add a "rank" field to each record of each period
  return _.mapValues(leaderboard, records => records.map((r, i) => ({ ...r, rank: i + 1 })));
});

export const getRecordsMap = createSelector(recordsSelector, ({ records }) => {
  return records;
});

export const getRecords = createSelector(recordsSelector, ({ records }) => {
  return Object.values(records);
});

export const getPlayerRecords = (state, playerId) => {
  return getRecordsMap(state)[playerId];
};
