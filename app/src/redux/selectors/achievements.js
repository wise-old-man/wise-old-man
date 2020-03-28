import { createSelector } from 'reselect';
import _ from 'lodash';

const achievementsSelector = state => state.achievements;

export const getAchievementsMap = createSelector(achievementsSelector, ({ achievements }) => {
  return _.mapValues(achievements, p => p.map(a => formatAchievement(a)));
});

export const getAchievements = createSelector(achievementsSelector, ({ achievements }) => {
  return Object.values(achievements);
});

export const getPlayerAchievements = (state, playerId) => {
  return getAchievementsMap(state)[playerId];
};

function formatAchievement(a) {
  const isDateUnknown = a.createdAt && a.createdAt.getFullYear() < 2000;
  return { ...a, unknownDate: !!isDateUnknown };
}
