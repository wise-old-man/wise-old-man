import { fetchCompetitionDetails } from '../../api/modules/competitions/services/FetchCompetitionDetailsService';
import prisma from '../../prisma';
import { Competition, Metric } from '../../types';
import { isActivity, isBoss, isSkill } from '../../utils/shared';
import { Job } from '../job.class';

interface Payload {
  competitionId: number;
}

export class UpdateCompetitionScoreJob extends Job<Payload> {
  static getUniqueJobId(payload: Payload) {
    return payload.competitionId.toString();
  }

  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const competition = await prisma.competition.findFirst({
      where: { id: payload.competitionId }
    });

    if (!competition) {
      return;
    }

    const currentScore = competition.score;
    const newScore = await calculateScore(competition);

    if (newScore === currentScore) return;

    await prisma.competition.update({
      where: { id: competition.id },
      data: { score: newScore }
    });
  }
}

async function calculateScore(competition: Competition): Promise<number> {
  const now = new Date();
  let score = 0;

  // If has ended
  if (competition.endsAt < now || !competition.visible) {
    return score;
  }

  const { group, metrics, participations } = await fetchCompetitionDetails(competition.id);

  const activeParticipants = participations.filter(p => p.progress.gained > 0);

  const averageGained =
    activeParticipants.map(a => a.progress.gained).reduce((acc, curr) => acc + curr, 0) /
    activeParticipants.length;

  // If is ongoing
  if (competition.startsAt <= now && competition.endsAt >= now) {
    score += 100;
  }

  // If is upcoming
  if (competition.startsAt > now) {
    const daysLeft = (competition.startsAt.getTime() - now.getTime()) / 1000 / 3600 / 24;
    score += daysLeft > 7 ? 60 : 80;
  }

  // If is group competition
  if (group) {
    // The highest of 40, or 40% of the group's score
    score += Math.max(40, group.score * 0.4);

    if (group.verified) {
      score += 50;
    }
  }

  // If has atleast 10 active participants
  if (activeParticipants.length >= 10) {
    score += 60;

    // If has atleast 50 active participants
    if (activeParticipants.length >= 50) {
      score += 80;
    }
  }

  if (isSkill(metrics[0].metric)) {
    // If the average active participant has gained > 10k exp
    if (averageGained > 10_000) {
      score += 30;

      // If the average active participant has gained > 100k exp
      if (averageGained > 100_000) {
        score += 50;
      }
    }
  }

  if (isBoss(metrics[0].metric)) {
    // If the average active participant has gained > 5 kc
    if (averageGained > 5) {
      score += 30;

      // If the average active participant has gained > 30 kc
      if (averageGained > 20) {
        score += 50;
      }
    }
  }

  if (isActivity(metrics[0].metric)) {
    // If the average active participant has gained > 5 score
    if (averageGained > 5) {
      score += 30;

      // If the average active participant has gained > 50 score
      if (averageGained > 20) {
        score += 50;
      }
    }
  }

  // Discourage "overall" competitions, they are often tests
  if (metrics.length === 1 && metrics[0].metric === Metric.OVERALL) {
    score -= 30;
  }

  // Discourage "over 2 weeks long" competitions
  if (competition.endsAt.getTime() - competition.startsAt.getTime() < 1_209_600_000) {
    score += 50;
  }

  // Encourage competitions with multiple metrics (instead of multiple single-metric competitions)
  if (metrics.length > 1) {
    score += 30;
  }

  return Math.max(0, score);
}
