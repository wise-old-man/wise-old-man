const { Player, Snapshot, Membership, Achievement, Competition } = require('../database');
const playerService = require('./modules/players/player.service');
const groupService = require('./modules/groups/group.service');
const jobs = require('./jobs');
const events = require('./events');

function setup() {
  Player.afterCreate(({ username }) => {
    jobs.add('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
  });

  Achievement.afterBulkCreate(async achievements => {
    if (!achievements || achievements.length === 0) return;

    const { playerId } = achievements[0];
    const now = new Date();
    const newAchievements = achievements.filter(a => now - a.createdAt < 30000);

    if (newAchievements.length === 0) return;

    const groups = await groupService.getPlayerGroups(playerId);

    if (!groups || groups.length === 0) return;

    const player = await playerService.findById(playerId);

    groups.forEach(g => {
      const payload = { groupId: g.id, player, achievements: newAchievements };
      events.dispatch('GroupMemberAchievements', payload);
    });
  });

  Competition.beforeUpdate((competition, options) => {
    if (!competition || !options || !options.fields) return;

    const editedFields = options.fields;

    // Start date has been changed
    if (editedFields.includes('startsAt')) {
      setupCompetitionStart(competition);
    }

    // End date has been changed
    if (editedFields.includes('endsAt')) {
      setupCompetitionEnd(competition);
    }
  });

  Competition.afterCreate(competition => {
    if (!competition) return;

    events.dispatch('GroupCompetitionCreated', { competition });

    // Schedule all initial competition timed events (onStarted, onEnding, etc)
    setupCompetitionStart(competition);
    setupCompetitionEnd(competition);
  });

  Snapshot.afterCreate(({ playerId }) => {
    jobs.add('SyncPlayerAchievements', { playerId });
    jobs.add('SyncPlayerInitialValues', { playerId });

    // Delay this to ensure SyncPlayerInitialValues runs first
    jobs.add('SyncPlayerRecords', { playerId }, { delay: 10000 });
  });

  Snapshot.afterBulkCreate(snapshots => {
    if (!snapshots || !snapshots.length) return;

    const { playerId } = snapshots[0];

    jobs.add('SyncPlayerRecords', { playerId });
    jobs.add('ReevaluatePlayerAchievements', { playerId });
  });

  Membership.afterBulkCreate(async memberships => {
    if (!memberships || !memberships.length) return;

    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    if (!playerIds || playerIds.length === 0) return;

    // Handle jobs
    jobs.add('AddToGroupCompetitions', { groupId, playerIds });

    // Handle events
    const players = await playerService.findAllByIds(playerIds);
    events.dispatch('GroupMembersJoined', { groupId, players });
  });

  Membership.afterBulkDestroy(async info => {
    if (!info || !info.where) return;

    const { groupId, playerId } = info.where;

    if (!playerId || playerId.length === 0) return;

    // Handle jobs
    jobs.add('RemoveFromGroupCompetitions', { groupId, playerIds: playerId });

    // Handle events
    const players = await playerService.findAllByIds(playerId);
    events.dispatch('GroupMembersLeft', { groupId, players });
  });
}

function setupCompetitionStart(competition) {
  if (!competition) return;

  const { id, startsAt } = competition;

  // On competition started
  jobs.schedule('CompetitionStarted', { competitionId: id }, startsAt);

  // On competition starting
  const starting24h = new Date(startsAt - 24 * 60 * 60 * 1000);
  jobs.schedule('CompetitionStarting', { competitionId: id, minutes: 24 * 60 }, starting24h);

  const starting6h = new Date(startsAt - 6 * 60 * 60 * 1000);
  jobs.schedule('CompetitionStarting', { competitionId: id, minutes: 6 * 60 }, starting6h);

  const starting1h = new Date(startsAt - 60 * 60 * 1000);
  jobs.schedule('CompetitionStarting', { competitionId: id, minutes: 60 }, starting1h);

  const starting5mins = new Date(startsAt - 5 * 60 * 1000);
  jobs.schedule('CompetitionStarting', { competitionId: id, minutes: 5 }, starting5mins);
}

function setupCompetitionEnd(competition) {
  if (!competition) return;

  const { id, endsAt } = competition;

  // On competition ended
  jobs.schedule('CompetitionEnded', { competitionId: id }, endsAt);

  // On competition ending
  const ending24h = new Date(endsAt - 24 * 60 * 60 * 1000);
  jobs.schedule('CompetitionEnding', { competitionId: id, minutes: 24 * 60 }, ending24h);

  const ending6h = new Date(endsAt - 6 * 60 * 60 * 1000);
  jobs.schedule('CompetitionEnding', { competitionId: id, minutes: 6 * 60 }, ending6h);

  const ending1h = new Date(endsAt - 60 * 60 * 1000);
  jobs.schedule('CompetitionEnding', { competitionId: id, minutes: 60 }, ending1h);

  const ending5mins = new Date(endsAt - 5 * 60 * 1000);
  jobs.schedule('CompetitionEnding', { competitionId: id, minutes: 5 }, ending5mins);

  const ending1min = new Date(endsAt - 60 * 1000);
  jobs.schedule('CompetitionEnding', { competitionId: id, minutes: 1 }, ending1min);
}

exports.setup = setup;
