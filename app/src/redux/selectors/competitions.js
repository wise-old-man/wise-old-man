import { createSelector } from 'reselect';
import _ from 'lodash';
import { COLORS } from '../../config';
import { durationBetween, formatDate } from '../../utils';

const competitionSelector = state => state.competitions;

export const isFetchingAll = createSelector(
  competitionSelector,
  competitions => competitions.isFetchingAll
);

export const getCompetitionsMap = createSelector(competitionSelector, ({ competitions }) => {
  return _.mapValues(competitions, comp => formatCompetition(comp));
});

export const getPlayerCompetitionsMap = createSelector(
  competitionSelector,
  ({ playerCompetitions }) => {
    return _.mapValues(playerCompetitions, comps => comps.map(c => formatCompetition(c)));
  }
);

export const getCompetitions = createSelector(competitionSelector, ({ competitions }) => {
  return Object.values(competitions).map(c => formatCompetition(c));
});

export const getCompetition = (state, id) => {
  return getCompetitionsMap(state)[id];
};

export const getPlayerCompetitions = (state, playerId) => {
  return getPlayerCompetitionsMap(state)[playerId];
};

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
    const filteredPoints = [..._.uniqBy(diffPoints, 'y'), diffPoints[diffPoints.length - 1]];

    datasets.push({
      borderColor: COLORS[i],
      pointBorderWidth: 4,
      label: participant.username,
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
    formatted.countdown = `Ended at ${formatDate(endsAt)}`;
  } else if (startsAt < curDate && endsAt > curDate) {
    formatted.status = 'ongoing';
    formatted.countdown = `Ends in ${durationBetween(curDate, endsAt, 2)}`;
  }

  return formatted;
}
