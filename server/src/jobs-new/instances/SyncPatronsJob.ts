import { Job } from '../job.utils';

export class SyncPatronsJob extends Job<unknown> {
  async execute() {
    console.log(this.name);
    this.jobManager.add('UpdateGroupScoreJob', { groupId: 123 });
  }
}
