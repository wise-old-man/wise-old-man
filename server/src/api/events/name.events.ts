import { isTesting } from '../../env';
import { NameChange } from '../../database/models';
import metrics from '../services/external/metrics.service';
import * as nameService from '../services/internal/name.service';

async function onNameChangeCreated(nameChange: NameChange) {
  if (isTesting()) return;

  // Delay this action to prevent proccessing too many
  // simultaneous name changes after a bulk submission
  setTimeout(async () => {
    await metrics.measureReaction('AutoNameReview', () => nameService.autoReview(nameChange.id));
  }, Math.random() * 120_000);
}

export { onNameChangeCreated };
