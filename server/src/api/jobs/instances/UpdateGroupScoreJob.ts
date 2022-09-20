import prisma, { Group } from '../../../prisma';
import { PRIVELEGED_GROUP_ROLES, GroupRole } from '../../../utils';
import * as groupServices from '../../modules/groups/group.services';
import * as competitionServices from '../../modules/competitions/competition.services';
import { JobType, JobDefinition, JobOptions } from '../job.types';

export interface UpdateGroupScorePayload {
  groupId: number;
}

class UpdateGroupScoreJob implements JobDefinition<UpdateGroupScorePayload> {
  type: JobType;
  options: JobOptions;

  constructor() {
    this.type = JobType.UPDATE_GROUP_SCORE;
    this.options = { rateLimiter: { max: 1, duration: 20_000 } };
  }

  async execute(data: UpdateGroupScorePayload) {
    const group = await prisma.group.findFirst({
      where: { id: data.groupId }
    });

    const currentScore = group.score;
    const newScore = await calculateScore(group);

    if (newScore !== currentScore) {
      await prisma.group.update({
        where: { id: group.id },
        data: { score: newScore }
      });
    }
  }
}

async function calculateScore(group: Group): Promise<number> {
  let score = 0;

  const now = new Date();
  const members = await groupServices.fetchGroupMembers({ id: group.id });

  if (!members || members.length === 0) {
    return score;
  }

  const competitions = await competitionServices.findGroupCompetitions({ groupId: group.id });
  const averageOverallExp = members.reduce((acc: any, cur: any) => acc + cur, 0) / members.length;

  // If has atleast one leader
  if (members.filter(m => PRIVELEGED_GROUP_ROLES.includes(m.role as GroupRole)).length >= 1) {
    score += 30;
  }

  // If has atleast 10 players
  if (members.length >= 10) {
    score += 20;

    // If has atleast 50 players
    if (members.length >= 50) {
      score += 40;
    }
  }

  // If average member overall exp > 30m
  if (averageOverallExp >= 30_000_000) {
    score += 30;

    // If average member overall exp > 100m
    if (averageOverallExp >= 100_000_000) {
      score += 60;
    }
  }

  // If has a clan chat
  if (group.clanChat && group.clanChat.length > 0) {
    score += 50;
  }

  // If has a description
  if (group.description && group.description.length > 0) {
    score += 40;
  }

  // If has a homeworld
  if (group.homeworld && group.homeworld > 0) {
    score += 20;
  }

  // If is verified (clan leader is in our discord)
  if (group.verified) {
    score += 100;
  }

  // If has atleast one ongoing competition
  if (competitions.filter(c => c.startsAt <= now && c.endsAt >= now).length >= 1) {
    score += 50;
  }

  // If has atleast one upcoming competition
  if (competitions.filter(c => c.startsAt >= now).length >= 1) {
    score += 30;
  }

  return score;
}

export default new UpdateGroupScoreJob();
