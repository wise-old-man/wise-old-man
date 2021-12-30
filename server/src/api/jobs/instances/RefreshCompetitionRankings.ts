import { isActivity, isBoss, isSkill } from '@wise-old-man/utils';
import { Competition } from '../../../database/models';
import metricsService from '../../services/external/metrics.service';
import * as competitionService from '../../services/internal/competition.service';
import { Job } from '../index';

class RefreshCompetitionRankings implements Job {
  name: string;

  constructor() {
    this.name = 'RefreshCompetitionRankings';
  }

  async handle(): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const allCompetitions = await Competition.findAll();

      await Promise.all(
        allCompetitions.map(async competition => {
          const currentScore = competition.score;
          const newScore = await calculateScore(competition);

          if (newScore !== currentScore) {
            await competition.update({ score: newScore });
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

async function calculateScore(competition: Competition): Promise<number> {
  const now = new Date();
  let score = 0;

  // If has ended
  if (competition.endsAt < now) {
    return score;
  }

  const details = await competitionService.getDetails(competition);
  const activeParticipants = details.participants.filter(p => p.progress.gained > 0);
  const averageGained = details.totalGained / activeParticipants.length;

  // If is ongoing
  if (competition.startsAt <= now && competition.endsAt >= now) {
    score += 100;
  }

  // If is upcoming
  if (competition.startsAt > now) {
    const daysLeft = (competition.startsAt.getTime() - now.getTime()) / 1000 / 3600 / 24;

    if (daysLeft > 7) {
      score += 60;
    } else {
      score += 80;
    }
  }

  // If is group competition
  if (details.group) {
    // The highest of 30, or 30% of the group's score
    score += Math.max(40, details.group.score * 0.4);

    if (details.group.verified) {
      score += 50;
    }
  }

  // If has atleast 10 active participants
  if (activeParticipants.length >= 10) {
    score += 60;
  }

  // If has atleast 50 active participants
  if (activeParticipants.length >= 50) {
    score += 80;
  }

  if (isSkill(competition.metric)) {
    // If the average active participant has gained > 10k exp
    if (averageGained > 10000) {
      score += 30;
    }

    // If the average active participant has gained > 100k exp
    if (averageGained > 100000) {
      score += 50;
    }
  }

  if (isBoss(competition.metric)) {
    // If the average active participant has gained > 5 kc
    if (averageGained > 5) {
      score += 30;
    }

    // If the average active participant has gained > 30 kc
    if (averageGained > 20) {
      score += 50;
    }
  }

  if (isActivity(competition.metric)) {
    // If the average active participant has gained > 5 score
    if (averageGained > 5) {
      score += 30;
    }

    // If the average active participant has gained > 50 score
    if (averageGained > 20) {
      score += 50;
    }
  }

  // Discourage "overall" competitions, they are often tests
  if (competition.metric !== 'overall') {
    score += 30;
  }

  // Discourage "over 2 weeks long" competitions
  if (competition.endsAt.getTime() - competition.startsAt.getTime() < 1209600000) {
    score += 50;
  }

  return score;
}

export default new RefreshCompetitionRankings();
