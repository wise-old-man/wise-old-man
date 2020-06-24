import { syncInitialValues } from '../../modules/deltas/delta.service';

export default {
  name: 'SyncPlayerInitialValues',
  async handle({ data }) {
    const { playerId } = data;
    await syncInitialValues(playerId);
  }
};
