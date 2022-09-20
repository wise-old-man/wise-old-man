import prisma, { Competition } from '../../../prisma';
import { Metric, isSkill, isBoss, isActivity } from '../../../utils';
import * as competitionServices from '../../modules/competitions/competition.services';
import { JobType, JobDefinition } from '../job.types';

export interface UpdateCompetitionScorePayload {
  competitionId: number;
}

class UpdateCompetitionScoreJob implements JobDefinition<UpdateCompetitionScorePayload> {
  type: JobType;

  constructor() {
    this.type = JobType.UPDATE_COMPETITION_SCORE;
  }

  async execute(data: UpdateCompetitionScorePayload) {
    const competition = await prisma.competition.findFirst({
      where: { id: data.competitionId }
    });

    const currentScore = competition.score;
    const newScore = await calculateScore(competition);

    if (newScore !== currentScore) {
      await prisma.competition.update({
        where: { id: competition.id },
        data: { score: newScore }
      });
    }
  }
}

async function calculateScore(competition: Competition): Promise<number> {
  const now = new Date();
  let score = 0;

  // If has ended
  if (competition.endsAt < now) {
    return score;
  }

  const details = await competitionServices.fetchCompetitionDetails({ id: competition.id });

  const activeParticipants = details.participations.filter(p => p.progress.gained > 0);

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
  if (details.group) {
    // The highest of 40, or 40% of the group's score
    score += Math.max(40, details.group.score * 0.4);

    if (details.group.verified) {
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

  if (isSkill(competition.metric)) {
    // If the average active participant has gained > 10k exp
    if (averageGained > 10_000) {
      score += 30;

      // If the average active participant has gained > 100k exp
      if (averageGained > 100_000) {
        score += 50;
      }
    }
  }

  if (isBoss(competition.metric)) {
    // If the average active participant has gained > 5 kc
    if (averageGained > 5) {
      score += 30;

      // If the average active participant has gained > 30 kc
      if (averageGained > 20) {
        score += 50;
      }
    }
  }

  if (isActivity(competition.metric)) {
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
  if (competition.metric !== Metric.OVERALL) {
    score += 30;
  }

  // Discourage "over 2 weeks long" competitions
  if (competition.endsAt.getTime() - competition.startsAt.getTime() < 1_209_600_000) {
    score += 50;
  }

  return score;
}

export default new UpdateCompetitionScoreJob();
