import jobs from '../../jobs';
import discord from '../../util/discord';

function onCompetitionCreated(competition) {
  setupCompetitionStart(competition);
  setupCompetitionEnd(competition);

  discord.dispatch('COMPETITION_CREATED', { groupId: competition.groupId, competition });
}

function onCompetitionUpdated(competition, editedFields) {
  // Start date has been changed
  if (editedFields.includes('startsAt')) {
    setupCompetitionStart(competition);
  }

  // End date has been changed
  if (editedFields.includes('endsAt')) {
    setupCompetitionEnd(competition);
  }
}

function onCompetitionStarted(competition) {
  const { groupId } = competition;

  if (competition.groupId) {
    discord.dispatch('COMPETITION_STARTED', { groupId, competition });
  }
}

function onCompetitionEnded(competition) {
  const { groupId, participants } = competition;

  if (groupId) {
    const standings = participants.map(({ displayName, progress }) => {
      return { displayName, gained: progress.gained };
    });

    discord.dispatch('COMPETITION_ENDED', { groupId, competition, standings });
  }
}

function onCompetitionStarting(competition, period) {
  const { groupId } = competition;

  if (competition.groupId) {
    discord.dispatch('COMPETITION_STARTING', { groupId, competition, period });
  }
}

function onCompetitionEnding(competition, period) {
  const { groupId } = competition;

  if (competition.groupId) {
    discord.dispatch('COMPETITION_ENDING', { groupId, competition, period });
  }
}

function setupCompetitionStart(competition) {
  if (!competition) return;

  const { id, startsAt } = competition;

  // Time intervals to send "starting in" notifications at (in minutes)
  // Current: 24h, 6h, 1h, 5mins
  const startingIntervals = [1440, 360, 60, 5];

  // On competition starting
  startingIntervals.forEach(minutes => {
    const date = new Date(startsAt - minutes * 60 * 1000);
    jobs.schedule('CompetitionStarting', { competitionId: id, minutes }, date);
  });

  // On competition started
  jobs.schedule('CompetitionStarted', { competitionId: id }, startsAt);
}

function setupCompetitionEnd(competition) {
  if (!competition) return;

  const { id, endsAt } = competition;

  // On competition ended
  jobs.schedule('CompetitionEnded', { competitionId: id }, endsAt);

  // Time intervals to send "ending in" notifications at (in minutes)
  // Current: 24h, 6h, 1h, 5mins
  const endingIntervals = [1440, 360, 60, 5];

  // On competition ending
  endingIntervals.forEach(minutes => {
    const date = new Date(endsAt - minutes * 60 * 1000);
    jobs.schedule('CompetitionStarting', { competitionId: id, minutes }, date);
  });
}

export {
  onCompetitionCreated,
  onCompetitionUpdated,
  onCompetitionStarted,
  onCompetitionEnded,
  onCompetitionStarting,
  onCompetitionEnding
};
