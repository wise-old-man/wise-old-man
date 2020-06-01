import { createSelector } from 'reselect';

const groupHiscoresSelector = state => state.hiscores.groupHiscores;

export const getGroupHiscoresMap = createSelector(groupHiscoresSelector, map => {
  return map;
});

export const getGroupHiscores = (state, groupId) => getGroupHiscoresMap(state)[groupId];
