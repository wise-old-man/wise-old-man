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
    jobs.schedule('CompetitionEnding', { competitionId: id, minutes }, date);
  });
}

exports.setup = setup;
