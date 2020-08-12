import * as deltaService from '../../services/internal/delta.service';
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
