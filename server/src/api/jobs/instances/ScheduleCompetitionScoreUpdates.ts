import { Op } from 'sequelize';
import { Competition } from '../../../database/models';
import metricsService from '../../services/external/metrics.service';
import jobs, { Job } from '../index';

class ScheduleCompetitionScoreUpdates implements Job {
  name: string;

  constructor() {
    this.name = 'ScheduleCompetitionScoreUpdates';
  }

  async handle(): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const allCompetitions = await Competition.findAll({
        attributes: ['id'],
        where: {
          [Op.or]: [
            {
              endsAt: { [Op.gt]: new Date() }
            },
            {
              score: { [Op.gt]: 0 }
            }
          ]
        }
      });

      allCompetitions.forEach(competition => {
        jobs.add('UpdateCompetitionScore', { competitionId: competition.id });
      });

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new ScheduleCompetitionScoreUpdates();
