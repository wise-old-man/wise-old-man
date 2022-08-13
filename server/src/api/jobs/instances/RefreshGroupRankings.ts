import { GroupRole, PRIVELEGED_GROUP_ROLES } from '../../../utils';
import prisma, { Group } from '../../../prisma';
import metricsService from '../../services/external/metrics.service';
import * as groupServices from '../../modules/groups/group.services';
import * as competitionServices from '../../modules/competitions/competition.services';
import { Job } from '../index';

class RefreshGroupRankings implements Job {
  name: string;

  constructor() {
    this.name = 'RefreshGroupRankings';
  }

  async handle(): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const allGroups = await prisma.group.findMany();

      await Promise.all(
        allGroups.map(async group => {
          const currentScore = group.score;
          const newScore = await calculateScore(group);

          if (newScore !== currentScore) {
            await prisma.group.update({
              where: { id: group.id },
              data: { score: newScore }
            });
          }
        })
      );

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
  const members = await groupServices.fetchGroupMembers({ id: group.id });
  const competitions = await competitionServices.findGroupCompetitions({ groupId: group.id });
  const averageOverallExp = members.reduce((acc: any, cur: any) => acc + cur, 0) / members.length;

  if (!members || members.length === 0) {
    return score;
  }

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

export default new RefreshGroupRankings();
