import { createSelector } from 'reselect';
import _ from 'lodash';

const groupHiscoresSelector = state => state.hiscores.groupHiscores;

export const getGroupHiscoresMap = createSelector(groupHiscoresSelector, map => {
  // Add a "groupRank" field to each hiscores row
  return _.mapValues(map, hiscores => hiscores.map((d, i) => ({ ...d, groupRank: i + 1 })));
});

export const getGroupHiscores = (state, groupId) => getGroupHiscoresMap(state)[groupId];
