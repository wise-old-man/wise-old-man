import { createSelector } from 'reselect';
import { mapValues } from 'lodash';

const rootSelector = state => state.hiscores;
const groupHiscoresSelector = state => state.hiscores.groupHiscores;

export const isFetching = createSelector(rootSelector, root => root.isFetching);

export function getGroupHiscores(groupId) {
  return state => getGroupHiscoresMap(state)[groupId];
}

const getGroupHiscoresMap = createSelector(groupHiscoresSelector, map => {
  // Add a "groupRank" field to each hiscores row
  return mapValues(map, hiscores => hiscores.map((d, i) => ({ ...d, groupRank: i + 1 })));
});
