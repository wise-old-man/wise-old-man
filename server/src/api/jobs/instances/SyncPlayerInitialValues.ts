import * as deltaService from 'api/services/internal/deltas';
import { Job } from '../index';

class SyncPlayerInitialValues implements Job {
  name: string;

  constructor() {
    this.name = 'SyncPlayerInitialValues';
  }

  async handle(data: any): Promise<void> {
    const { playerId } = data;
    await deltaService.syncInitialValues(playerId);
  }
}

export default new SyncPlayerInitialValues();
