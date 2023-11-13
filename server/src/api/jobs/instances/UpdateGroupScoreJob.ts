import prisma from '../../../prisma';
import { GroupDetails, PRIVELEGED_GROUP_ROLES } from '../../../utils';
import * as competitionServices from '../../modules/competitions/competition.services';
import { JobType, JobDefinition } from '../job.types';
import * as groupServices from '../../modules/groups/group.services';

export interface UpdateGroupScorePayload {
  groupId: number;
}

class UpdateGroupScoreJob implements JobDefinition<UpdateGroupScorePayload> {
  type: JobType;

  constructor() {
    this.type = JobType.UPDATE_GROUP_SCORE;
  }

  async execute(data: UpdateGroupScorePayload) {
    const groupDetails = await groupServices.fetchGroupDetails({ id: data.groupId });

    const currentScore = groupDetails.score;
    const newScore = await calculateScore(groupDetails);

    if (newScore !== currentScore) {
      await prisma.group.update({
        where: { id: data.groupId },
        data: { score: newScore }
      });
    }
  }
}

async function calculateScore(group: GroupDetails): Promise<number> {
  let score = 0;

  const now = new Date();
  const { memberships } = group;

  if (!memberships || memberships.length === 0) {
    return score;
  }

  const competitions = await competitionServices.findGroupCompetitions({ groupId: group.id });
  const averageOverallExp = memberships.reduce((acc, cur) => acc + cur.player.exp, 0) / memberships.length;

  // If has atleast one leader
  if (memberships.filter(m => PRIVELEGED_GROUP_ROLES.includes(m.role)).length >= 1) {
    score += 30;
  }

  // If has atleast 10 players
  if (memberships.length >= 10) {
    score += 20;

    // If has atleast 50 players
    if (memberships.length >= 50) {
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

  // If is a patreon supporter
  if (group.patron) {
    score += 50;

    if (group.profileImage) {
      score += 20;
    }

    if (group.bannerImage) {
      score += 10;
    }
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
