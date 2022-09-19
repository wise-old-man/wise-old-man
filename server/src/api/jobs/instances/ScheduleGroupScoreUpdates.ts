import { Group } from '../../../database/models';
import metricsService from '../../services/external/metrics.service';
import jobs, { Job } from '../index';

class ScheduleGroupScoreUpdates implements Job {
  name: string;

  constructor() {
    this.name = 'ScheduleGroupScoreUpdates';
  }

  async handle(): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const allGroups = await Group.findAll({
        attributes: ['id']
      });

      allGroups.forEach(group => {
        jobs.add('UpdateGroupScore', { groupId: group.id });
      });

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new ScheduleGroupScoreUpdates();
