import { findGroupCompetitions } from '../../api/modules/competitions/services/FindGroupCompetitionsService';
import { fetchGroupDetails } from '../../api/modules/groups/services/FetchGroupDetailsService';
import prisma from '../../prisma';
import { Group, Membership, Player } from '../../types';
import { PRIVILEGED_GROUP_ROLES } from '../../utils/shared';
import { Job } from '../job.class';

interface Payload {
  groupId: number;
}

export class UpdateGroupScoreJob extends Job<Payload> {
  static getUniqueJobId(payload: Payload) {
    return payload.groupId.toString();
  }

  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const { group, memberships } = await fetchGroupDetails(payload.groupId);

    const currentScore = group.score;
    const newScore = await calculateScore(group, memberships);

    if (newScore === currentScore) return;

    await prisma.group.update({
      where: { id: payload.groupId },
      data: { score: newScore }
    });
  }
}

async function calculateScore(
  group: Group,
  memberships: Array<{ membership: Membership; player: Player }>
): Promise<number> {
  let score = 0;

  const now = new Date();

  if (!memberships || memberships.length === 0 || !group.visible) {
    return score;
  }

  const competitions = await findGroupCompetitions(group.id);
  const averageOverallExp = memberships.reduce((acc, cur) => acc + cur.player.exp, 0) / memberships.length;

  // If has atleast one leader
  if (memberships.filter(m => PRIVILEGED_GROUP_ROLES.includes(m.membership.role)).length >= 1) {
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
  if (competitions.filter(c => c.competition.startsAt <= now && c.competition.endsAt >= now).length >= 1) {
    score += 50;
  }

  // If has atleast one upcoming competition
  if (competitions.filter(c => c.competition.startsAt >= now).length >= 1) {
    score += 30;
  }

  return score;
}
