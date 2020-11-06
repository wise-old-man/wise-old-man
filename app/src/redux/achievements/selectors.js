import { createSelector } from 'reselect';
import { mapValues } from 'lodash';
import { getPlayer } from '../players/selectors';
import { getTotalLevel } from '../../utils';
import { ALL_METRICS } from '../../config';

const rootSelector = state => state.achievements;
const playerAchievementsSelector = state => state.achievements.playerAchievements;
const groupAchievementsSelector = state => state.achievements.groupAchievements;

const getPlayerAchievementsMap = createSelector(playerAchievementsSelector, map => {
  return mapValues(map, p => p.map(a => formatAchievement(a)));
});

const getGroupAchievementsMap = createSelector(groupAchievementsSelector, map => {
  return mapValues(map, p => p.map(a => formatAchievement(a)));
});

export const isFetchingGroupAchievements = createSelector(
  rootSelector,
  root => root.isFetchingGroupAchievements
);

export const getPlayerAchievements = (state, username) => getPlayerAchievementsMap(state)[username];
export const getGroupAchievements = (state, groupId) => getGroupAchievementsMap(state)[groupId];

export const getPlayerAchievementsGrouped = (state, username) => {
  const player = getPlayer(state, username);
  const list = getPlayerAchievements(state, username);

  if (!list) {
    return [];
  }

  const sorted = list.sort(
    (a, b) =>
      a.metric.localeCompare(b.metric) || a.measure.localeCompare(b.measure) || a.threshold - b.threshold
  );

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
    .sort((a, b) => ALL_METRICS.indexOf(a.metric) - ALL_METRICS.indexOf(b.metric))
    .sort((a, b) => a.achievements.length - b.achievements.length);

  return processed;
};

function processGroup(player, group) {
  if (!player || !player.latestSnapshot) {
    return group;
  }

  const { latestSnapshot } = player;

  if (group.metric === 'combat') {
    const progress = {
      start: 0,
      end: 126,
      current: player.combatLevel,
      percentToNextTier: player.combatLevel / 126,
      absolutePercent: player.combatLevel / 126
    };
    return { ...group, achievements: [...group.achievements.map(a => ({ ...a, progress }))] };
  }

  if (group.metric === 'overall' && group.measure === 'levels') {
    const totalLevel = getTotalLevel(latestSnapshot);
    const progress = {
      start: 36,
      end: 2277,
      current: totalLevel,
      percentToNextTier: totalLevel / 2277,
      absolutePercent: totalLevel / 2277
    };
    return { ...group, achievements: [...group.achievements.map(a => ({ ...a, progress }))] };
  }

  if (latestSnapshot[group.metric]) {
    const currentValue = latestSnapshot[group.metric][group.measure];

    const processedAchievements = group.achievements.map((achievement, i) => {
      if (currentValue >= achievement.threshold) {
        return {
          ...achievement,
          progress: {
            start: 0,
            end: achievement.threshold,
            current: currentValue,
            percentToNextTier: 1,
            absolutePercent: 1
          }
        };
      }

      const prevStart = i === 0 ? 0 : group.achievements[i - 1].threshold;
      const nextTierProgress = (currentValue - prevStart) / (achievement.threshold - prevStart);

      return {
        ...achievement,
        progress: {
          start: 0,
          end: achievement.threshold,
          current: currentValue,
          percentToNextTier: Math.max(0, nextTierProgress),
          absolutePercent: currentValue / achievement.threshold
        }
      };
    });

    return { ...group, achievements: processedAchievements };
  }

  return group;
}

function formatAchievement(a) {
  const isDateUnknown = a.createdAt && a.createdAt.getFullYear() < 2000;
  return { ...a, unknownDate: !!isDateUnknown };
}
