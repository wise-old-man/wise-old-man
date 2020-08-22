import { PERIODS } from '../../constants';
import { syncDeltas, syncInitialValues } from '../../services/internal/delta.service';
import { Job } from '../index';

class SyncPlayerDeltas implements Job {
  name: string;

  constructor() {
    this.name = 'SyncPlayerDeltas';
  }

  async handle(data: any): Promise<void> {
    const { playerId, latestSnapshot } = data;

    const initialValues = await syncInitialValues(playerId, latestSnapshot);

    await Promise.all(
      PERIODS.map(async period => {
        await syncDeltas(playerId, period, latestSnapshot, initialValues);
      })
    );
  }
}

export default new SyncPlayerDeltas();
