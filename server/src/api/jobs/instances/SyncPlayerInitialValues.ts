import * as deltaService from '../../modules/deltas/delta.service';

export default {
  key: 'SyncPlayerInitialValues',
  async handle({ data }) {
    const { playerId } = data;
    await deltaService.syncInitialValues(playerId);
  }
};
