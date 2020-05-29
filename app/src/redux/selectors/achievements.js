import { createSelector } from 'reselect';
import _ from 'lodash';

const achievementsSelector = state => state.achievements.achievements;

export const getAchievementsMap = createSelector(achievementsSelector, map => {
  return _.mapValues(map, p => p.map(a => formatAchievement(a)));
});

export const getAchievements = createSelector(achievementsSelector, map => Object.values(map));

export const getPlayerAchievements = (state, playerId) => getAchievementsMap(state)[playerId];

export const getPlayerAchievementsGrouped = (state, playerId) => {
  const list = getPlayerAchievements(state, playerId);

  if (!list) {
    return [];
  }

  const sorted = list.sort((a, b) => {
    return a.metric.localeCompare(b.metric) || a.measure.localeCompare(b.measure);
  });

  const groups = [];
  let previousMetric = '';
  let previousMeasure = '';

  sorted.forEach(s => {
    if (s.metric === previousMetric && s.measure === previousMeasure) {
      groups[groups.length - 1].push(s);
    } else {
      groups.push([s]);
    }

    previousMetric = s.metric;
    previousMeasure = s.measure;
  });

  return groups;
};

function formatAchievement(a) {
  const isDateUnknown = a.createdAt && a.createdAt.getFullYear() < 2000;
  return { ...a, unknownDate: !!isDateUnknown };
}
