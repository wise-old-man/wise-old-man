import { mapValues, uniqBy } from 'lodash';
import { createSelector } from 'reselect';
import { COLORS } from '../../config';
import { durationBetween } from '../../utils';

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
      borderColor: COLORS[i],
      pointBorderWidth: 1,
      label: participant.displayName,
      data: filteredPoints,
      fill: false
    });
  });

  return datasets;
};

function formatCompetition(competition) {
  if (!competition) {
    return null;
  }

  const { startsAt, endsAt, participants } = competition;

  const curDate = new Date();

  const formatted = {
    ...competition,
    participants: participants ? participants.map((p, i) => ({ ...p, rank: i + 1 })) : []
  };

  if (startsAt > curDate) {
    formatted.status = 'upcoming';
    formatted.countdown = `Starts in ${durationBetween(curDate, startsAt, 2)}`;
  } else if (endsAt < curDate) {
    formatted.status = 'finished';
    formatted.countdown = `Ended ${durationBetween(endsAt, curDate, 1)} ago`;
  } else if (startsAt < curDate && endsAt > curDate) {
    formatted.status = 'ongoing';
    formatted.countdown = `Ends in ${durationBetween(curDate, endsAt, 2)}`;
  }

  return formatted;
}
