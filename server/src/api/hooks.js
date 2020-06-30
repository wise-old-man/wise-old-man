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
      newAchievements.forEach(a => {
        events.dispatch('GroupMemberAchievement', { groupId: g.id, player, achievement: a });
      });
    });
  });

  Competition.afterCreate(competition => {
    if (!competition || !competition.groupId) return;

    events.dispatch('GroupCompetitionCreated', { competition });
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

    // Handle jobs
    jobs.add('AddToGroupCompetitions', { groupId, playerIds });

    // Handle events
    const players = await playerService.findAllByIds(playerIds);

    players.forEach(({ id, displayName }) => {
      events.dispatch('GroupMemberJoined', { groupId, playerId: id, displayName });
    });
  });

  Membership.afterBulkDestroy(async info => {
    if (!info || !info.where) return;

    const { groupId, playerId } = info.where;

    // Handle jobs
    jobs.add('RemoveFromGroupCompetitions', { groupId, playerIds: playerId });

    // Handle events
    const players = await playerService.findAllByIds(playerId);

    players.forEach(({ id, displayName }) => {
      events.dispatch('GroupMemberLeft', { groupId, playerId: id, displayName });
    });
  });
}

exports.setup = setup;
