import { mapValues, uniqBy, uniq } from 'lodash';
import { createSelector } from 'reselect';
import { CHART_COLORS, SKILLS } from 'config';
import { durationBetween, getLevel } from 'utils';

const rootSelector = state => state.competitions;
const competitionsSelector = state => state.competitions.competitions;
const playerCompetitionsSelector = state => state.competitions.playerCompetitions;
const groupCompetitionsSelector = state => state.competitions.groupCompetitions;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetchingList = createSelector(rootSelector, root => root.isFetchingList);
export const isFetchingDetails = createSelector(rootSelector, root => root.isFetchingDetails);
export const isCreating = createSelector(rootSelector, root => root.isCreating);
export const isEditing = createSelector(rootSelector, root => root.isEditing);

const getCompetitionsMap = createSelector(competitionsSelector, map => {
  return mapValues(map, comp => formatCompetition(comp));
});

const getPlayerCompetitionsMap = createSelector(playerCompetitionsSelector, map => {
  return mapValues(map, comps => comps.map(c => formatCompetition(c)));
});

const getGroupCompetitionsMap = createSelector(groupCompetitionsSelector, map => {
  return mapValues(map, comps => comps.map(c => formatCompetition(c)));
});

export const getCompetitions = createSelector(competitionsSelector, map => {
  return Object.values(map)
    .map(c => formatCompetition(c))
    .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
});

export const getCompetition = (state, id) => getCompetitionsMap(state)[id];

export const getPlayerCompetitions = (state, username) => getPlayerCompetitionsMap(state)[username];

export const getGroupCompetitions = (state, groupId) => getGroupCompetitionsMap(state)[groupId];

export const getChartData = (state, id) => {
  const comp = getCompetition(state, id);

  if (!comp) {
    return [];
  }

  const datasets = [];

  if (!comp.participants || comp.participants.length === 0) {
    return datasets;
  }

  const topParticipants = comp.participants.filter(p => p.history && p.history.length > 0);

  topParticipants.forEach((participant, i) => {
    // Convert all the history data into chart points
    const points = participant.history.map(h => ({ x: h.date, y: h.value }));

    // Convert the exp values to exp delta values
    const diffPoints = points.map(p => ({ x: p.x, y: p.y - points[0].y }));

    // Include only unique points, and the last point (for visual clarity)
    const filteredPoints = [...uniqBy(diffPoints, 'y'), diffPoints[diffPoints.length - 1]];

    datasets.push({
      borderColor: CHART_COLORS[i],
      pointBorderWidth: 1,
      label: participant.displayName,
      data: filteredPoints,
      fill: false
    });
  });

  return datasets;
};

function formatTeams(participants) {
  if (!participants || participants.length === 0) return [];

  const teamNames = uniq(participants.map(p => p.teamName));
  const teamMap = Object.fromEntries(teamNames.map(t => [t, { name: t, participants: [] }]));

  participants.forEach(p => {
    teamMap[p.teamName].participants.push(p);
  });

  const teamsList = Object.values(teamMap).map(t => {
    // Sort participants by most gained, and add team rank
    const sortedParticipants = t.participants
      .sort((a, b) => b.progress.gained - a.progress.gained)
      .map((p, i) => ({ ...p, teamRank: i + 1 }));

    const totalGained = t.participants.map(p => p.progress.gained).reduce((a, c) => a + c);
    const avgGained = totalGained / t.participants.length;

    return { ...t, participants: sortedParticipants, totalGained, avgGained };
  });

  // Sort teams by most total gained
  return teamsList.sort((a, b) => b.totalGained - a.totalGained).map((t, i) => ({ ...t, rank: i + 1 }));
}

function formatParticipant(participant, index, calcLevels) {
  const formatted = { ...participant, rank: index + 1 };

  if (calcLevels) {
    const startLevel = getLevel(participant.progress.start);
    const endLevel = getLevel(participant.progress.end);
    formatted.levelsGained = endLevel - startLevel;
  }

  return formatted;
}

function formatCompetition(competition) {
  if (!competition) {
    return null;
  }

  const { startsAt, endsAt, participants, metric } = competition;

  const calcLevels = SKILLS.filter(s => s !== 'overall').includes(metric);

  const formattedParticipants = participants
    ? participants.map((p, i) => formatParticipant(p, i, calcLevels))
    : [];

  const formattedTeams = participants ? formatTeams(formattedParticipants) : [];

  const formattedCompetition = {
    ...competition,
    participants: formattedParticipants,
    teams: formattedTeams
  };

  const curDate = new Date();

  if (startsAt > curDate) {
    formattedCompetition.status = 'upcoming';
    formattedCompetition.countdown = `Starts in ${durationBetween(curDate, startsAt, 2)}`;
  } else if (endsAt < curDate) {
    formattedCompetition.status = 'finished';
    formattedCompetition.countdown = `Ended ${durationBetween(endsAt, curDate, 1)} ago`;
  } else if (startsAt < curDate && endsAt > curDate) {
    formattedCompetition.status = 'ongoing';
    formattedCompetition.countdown = `Ends in ${durationBetween(curDate, endsAt, 2)}`;
  }

  return formattedCompetition;
}
