import { UpdateGroupScoreJob } from '../../../jobs/instances/UpdateGroupScoreJob';
import experimentalJobManager from '../../../jobs/job.manager';
import prisma from '../../../prisma';
import { MemberJoinedEvent, MemberLeftEvent, MemberRoleChangeEvent, PlayerType } from '../../../utils';
import { JobType, jobManager } from '../../jobs';
import * as discordService from '../../services/external/discord.service';
import prometheus from '../../services/external/prometheus.service';
import { addToGroupCompetitions } from '../competitions/services/AddToGroupCompetitionsService';
import { removeFromGroupCompetitions } from '../competitions/services/RemoveFromGroupCompetitionsService';

async function onGroupUpdated(groupId: number) {
  // Trigger a score update job, without any instance id, so that it doesn't get deduplicated.
  await experimentalJobManager.add(new UpdateGroupScoreJob(groupId).unsetInstanceId());
}

async function onGroupCreated(groupId: number) {
  // Trigger a score update job, without any instance id, so that it doesn't get deduplicated.
  await experimentalJobManager.add(new UpdateGroupScoreJob(groupId).unsetInstanceId());
}

async function onMembersRolesChanged(events: MemberRoleChangeEvent[]) {
  await prometheus.trackEffect('dispatchMembersRolesChanged', async () => {
    await discordService.dispatchMembersRolesChanged(events);
  });
}

async function onMembersJoined(events: MemberJoinedEvent[]) {
  const groupId = events[0].groupId;
  const playerIds = events.map(m => m.playerId);

  // Add these new members to all upcoming and ongoing competitions
  await prometheus.trackEffect('addToGroupCompetitions', async () => {
    await addToGroupCompetitions(groupId, playerIds);
  });

  // Fetch all the newly added members
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } }
  });

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  // Dispatch this event to the discord service
  await prometheus.trackEffect('dispatchMembersJoined', async () => {
    await discordService.dispatchMembersJoined(groupId, events, players);
  });

  // Request updates for any new players
  players.forEach(({ username, type, registeredAt }) => {
    if (type !== PlayerType.UNKNOWN || Date.now() - registeredAt.getTime() > 60_000) return;
    jobManager.add({ type: JobType.UPDATE_PLAYER, payload: { username } });
  });
}

async function onMembersLeft(events: MemberLeftEvent[]) {
  const groupId = events[0].groupId;
  const playerIds = events.map(m => m.playerId);

  // Remove these players from ongoing/upcoming group competitions
  await prometheus.trackEffect('removeFromGroupCompetitions', async () => {
    await removeFromGroupCompetitions(groupId, playerIds);
  });

  // Dispatch this event to the discord service
  await prometheus.trackEffect('dispatchMembersLeft', async () => {
    await discordService.dispatchMembersLeft(groupId, playerIds);
  });
}

export { onGroupCreated, onGroupUpdated, onMembersJoined, onMembersLeft, onMembersRolesChanged };
