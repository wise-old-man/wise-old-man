import { isTesting } from '../../env';
import { NameChange } from '../../prisma';
import metrics from '../services/external/metrics.service';
import * as nameChangeServices from '../modules/name-changes/name-change.services';

async function onNameChangeCreated(nameChange: NameChange) {
  if (isTesting()) return;

  // Delay this action randomly to prevent proccessing too many
  // simultaneous name changes after a bulk submission
  setTimeout(async () => {
    await metrics.measureReaction('AutoNameReview', () =>
      nameChangeServices.autoReviewNameChange({ id: nameChange.id })
    );
  }, Math.random() * 120_000);
}

export { onNameChangeCreated };
