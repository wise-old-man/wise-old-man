import { GroupRole, PRIVELEGED_GROUP_ROLES } from '@wise-old-man/utils';
import { RateLimiter } from 'bull';
import { Group } from '../../../database/models';
import metricsService from '../../services/external/metrics.service';
import * as competitionService from '../../services/internal/competition.service';
import * as groupService from '../../services/internal/group.service';
import { Job } from '../index';

class UpdateGroupScore implements Job {
  name: string;
  rateLimiter: RateLimiter;

  constructor() {
    this.name = 'UpdateGroupScore';
    this.rateLimiter = { max: 1, duration: 20_000 };
  }

  async handle(data: any): Promise<void> {
    if (!data.groupId) return;

    const endTimer = metricsService.trackJobStarted();

    try {
      const group = await Group.findOne({ where: { id: data.groupId } });

      const currentScore = group.score;
      const newScore = await calculateScore(group);

      if (newScore !== currentScore) {
        await group.update({ score: newScore });
      }

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

async function calculateScore(group: Group): Promise<number> {
  let score = 0;

  const now = new Date();
  const members = await groupService.getMembersList(group);

  if (!members || members.length === 0) {
    return score;
  }

  const pagination = { limit: 100, offset: 0 };
  const competitions = await competitionService.getGroupCompetitions(group.id, pagination);
  const averageOverallExp = members.reduce((acc: any, cur: any) => acc + cur, 0) / members.length;

  // If has atleast one leader
  if (members.filter(m => PRIVELEGED_GROUP_ROLES.includes(m.role as GroupRole)).length >= 1) {
    score += 30;
  }

  // If has atleast 10 players
  if (members.length >= 10) {
    score += 20;
  }

  // If has atleast 50 players
  if (members.length >= 50) {
    score += 40;
  }

  // If average member overall exp > 30m
  if (averageOverallExp >= 30_000_000) {
    score += 30;
  }

  // If average member overall exp > 100m
  if (averageOverallExp >= 100_000_000) {
    score += 60;
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

export default new UpdateGroupScore();
