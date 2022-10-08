import { createSelector } from 'reselect';
import { mapValues } from 'lodash';
import { METRICS } from '@wise-old-man/utils';

const rootSelector = state => state.achievements;
const playerAchievementsSelector = state => state.achievements.playerAchievements;
const groupAchievementsSelector = state => state.achievements.groupAchievements;

const getPlayerAchievementsMap = createSelector(playerAchievementsSelector, map => {
  return mapValues(map, p => p.map(formatAchievement));
});

const getGroupAchievementsMap = createSelector(groupAchievementsSelector, map => {
  return mapValues(map, p => p.map(formatAchievement));
});

export const isFetchingGroupAchievements = createSelector(
  rootSelector,
  root => root.isFetchingGroupAchievements
);

export const isFetchingPlayerAchievements = createSelector(
  rootSelector,
  root => root.isFetchingPlayerAchievements
);

export function getGroupAchievements(groupId) {
  return state => getGroupAchievementsMap(state)[groupId];
}

export function getPlayerAchievements(username, includeMissing = false) {
  return state => {
    const achievements = getPlayerAchievementsMap(state)[username];

    if (!achievements || achievements.length === 0 || includeMissing) {
      return achievements;
    }

    return achievements.filter(a => !!a.createdAt);
  };
}

export function getPlayerAchievementsGrouped(username) {
  return state => {
    const achievements = getPlayerAchievementsMap(state)[username];

    if (!achievements) {
      return [];
    }

    const groups = [];

    achievements.forEach(a => {
      let group = groups.find(g => g.measure === a.measure && g.metric === a.metric);

      if (!group) {
        group = { metric: a.metric, measure: a.measure, achievements: [] };
        groups.push(group);
      }

      group.achievements.push(a);
    });

    return groups.sort((a, b) => METRICS.indexOf(a.metric) - METRICS.indexOf(b.metric));
  };
}

function formatAchievement(a) {
  const isDateUnknown = a.createdAt && a.createdAt.getFullYear() < 2000;
  return { ...a, unknownDate: !!isDateUnknown };
}
