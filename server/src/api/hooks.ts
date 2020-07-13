import { addJob, scheduleJob } from './jobs';
import { Player, Snapshot, Membership, Achievement, Competition } from '../database/models';
import * as playerService from './modules/players/player.service';
import * as groupService from './modules/groups/group.service';
import { eventDispatch } from './events';

function setup() {
  Player.afterCreate(({ username }) => {
    addJob('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
  });

  Achievement.afterBulkCreate(async achievements => {
    if (!achievements || achievements.length === 0) return;

    const { playerId } = achievements[0];
    const now: any = new Date();
    const newAchievements = achievements.filter(a => now - a.createdAt < 30000);

    if (newAchievements.length === 0) return;

    const groups = await groupService.getPlayerGroups(playerId);

    if (!groups || groups.length === 0) return;

    const player = await playerService.findById(playerId);

    groups.forEach(g => {
      const payload = { groupId: g.id, player, achievements: newAchievements };
      eventDispatch('GroupMemberAchievements', payload);
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

    eventDispatch('GroupCompetitionCreated', { competition });

    // Schedule all initial competition timed events (onStarted, onEnding, etc)
    setupCompetitionStart(competition);
    setupCompetitionEnd(competition);
  });

  Snapshot.afterCreate(({ playerId }) => {
    addJob('SyncPlayerAchievements', { playerId });
    addJob('SyncPlayerInitialValues', { playerId });

    // Delay this to ensure SyncPlayerInitialValues runs first
    addJob('SyncPlayerRecords', { playerId }, { delay: 10000 });
  });

  Snapshot.afterBulkCreate(snapshots => {
    if (!snapshots || !snapshots.length) return;

    const { playerId } = snapshots[0];

    addJob('SyncPlayerRecords', { playerId });
    addJob('ReevaluatePlayerAchievements', { playerId });
  });

  Membership.afterBulkCreate(async memberships => {
    if (!memberships || !memberships.length) return;

    const { groupId } = memberships[0];
    const playerIds = memberships.map(m => m.playerId);

    addJob('AddToGroupCompetitions', { groupId, playerIds });
  });

  Membership.afterBulkDestroy(async (info: any) => {
    if (!info || !info.where) {
      return;
    }

    const { groupId, playerId } = info.where;
    let playerIds: any;
    addJob('RemoveFromGroupCompetitions', { groupId, playerIds: playerId });
    if (!playerIds || playerIds.length === 0) return;

    // Handle jobs
    addJob('AddToGroupCompetitions', { groupId, playerIds });

    // Handle events
    const players = await playerService.findAllByIds(playerIds);
    eventDispatch('GroupMembersJoined', { groupId, players });
  });

  Membership.afterBulkDestroy(async info => {
    if (!info || !info.where) return;

    const { groupId, playerId }: any = info.where;

    if (!playerId || playerId.length === 0) return;

    // Handle jobs
    addJob('RemoveFromGroupCompetitions', { groupId, playerIds: playerId });

    // Handle events
    const players = await playerService.findAllByIds(playerId);
    eventDispatch('GroupMembersLeft', { groupId, players });
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
    scheduleJob('CompetitionStarting', { competitionId: id, minutes }, date);
  });

  // On competition started
  scheduleJob('CompetitionStarted', { competitionId: id }, startsAt);
}

function setupCompetitionEnd(competition) {
  if (!competition) return;

  const { id, endsAt } = competition;

  // On competition ended
  scheduleJob('CompetitionEnded', { competitionId: id }, endsAt);

  // Time intervals to send "ending in" notifications at (in minutes)
  // Current: 24h, 6h, 1h, 5mins
  const endingIntervals = [1440, 360, 60, 5];

  // On competition ending
  endingIntervals.forEach(minutes => {
    const date = new Date(endsAt - minutes * 60 * 1000);
    scheduleJob('CompetitionStarting', { competitionId: id, minutes }, date);
  });
}

export { setup };
