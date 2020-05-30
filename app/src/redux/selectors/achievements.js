import { createSelector } from 'reselect';
import _ from 'lodash';
import { getPlayer } from './players';
import { getTotalLevel } from '../../utils';

const achievementsSelector = state => state.achievements.achievements;

export const getAchievementsMap = createSelector(achievementsSelector, map => {
  return _.mapValues(map, p => p.map(a => formatAchievement(a)));
});

export const getAchievements = createSelector(achievementsSelector, map => Object.values(map));

export const getPlayerAchievements = (state, playerId) => getAchievementsMap(state)[playerId];

export const getPlayerAchievementsGrouped = (state, playerId) => {
  const player = getPlayer(state, playerId);
  const list = getPlayerAchievements(state, playerId);

  if (!list) {
    return [];
  }

  const sorted = list.sort((a, b) => {
    return a.metric.localeCompare(b.metric) || a.measure.localeCompare(b.measure) || a.value - b.value;
  });

  const groups = [];
  let previousMetric = '';
  let previousMeasure = '';

  sorted.forEach(s => {
    if (s.metric === previousMetric && s.measure === previousMeasure) {
      groups[groups.length - 1].achievements.push(s);
    } else {
      groups.push({ metric: s.metric, measure: s.measure, achievements: [s] });
    }

    previousMetric = s.metric;
    previousMeasure = s.measure;
  });

  const processed = groups
    .map(group => processGroup(player, group))
    .sort((a, b) => a.achievements.length - b.achievements.length);

  return processed;
};

function processGroup(player, group) {
  if (!player) {
    return group;
  }

  const { latestSnapshot } = player;

  if (group.metric === 'combat') {
    const progress = player.combatLevel / 126;
    return { ...group, achievements: [...group.achievements.map(a => ({ ...a, progress }))] };
  }

  if (group.metric === 'overall' && group.measure === 'levels') {
    const progress = getTotalLevel(latestSnapshot) / 2277;
    return { ...group, achievements: [...group.achievements.map(a => ({ ...a, progress }))] };
  }

  if (latestSnapshot[group.metric]) {
    const currentValue = latestSnapshot[group.metric][group.measure];

    const processedAchievements = group.achievements.map((achievement, i) => {
      if (currentValue >= achievement.value) {
        return { ...achievement, progress: 1 };
      }

      const prevStart = i === 0 ? 0 : group.achievements[i - 1].value;
      const currentProgress = Math.max(0, (currentValue - prevStart) / (achievement.value - prevStart));

      return { ...achievement, progress: currentProgress };
    });

    return { ...group, achievements: processedAchievements };
  }

  return group;
}

function formatAchievement(a) {
  const isDateUnknown = a.createdAt && a.createdAt.getFullYear() < 2000;
  return { ...a, unknownDate: !!isDateUnknown };
}
