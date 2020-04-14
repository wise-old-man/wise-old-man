import { createSelector } from 'reselect';
import _ from 'lodash';

const achievementsSelector = state => state.achievements.achievements;

export const getAchievementsMap = createSelector(achievementsSelector, map => {
  return _.mapValues(map, p => p.map(a => formatAchievement(a)));
});

export const getAchievements = createSelector(achievementsSelector, map => Object.values(map));

export const getPlayerAchievements = (state, playerId) => getAchievementsMap(state)[playerId];

function formatAchievement(a) {
  const isDateUnknown = a.createdAt && a.createdAt.getFullYear() < 2000;
  return { ...a, unknownDate: !!isDateUnknown };
}
