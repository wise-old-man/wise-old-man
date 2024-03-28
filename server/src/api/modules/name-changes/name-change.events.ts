import { NameChange } from '../../../prisma';
import jobManager from '../../../jobs/job.manager';

async function onNameChangeSubmitted(nameChange: NameChange) {
  jobManager.add('ReviewNameChangeJob', { nameChangeId: nameChange.id });
}

export { onNameChangeSubmitted };
