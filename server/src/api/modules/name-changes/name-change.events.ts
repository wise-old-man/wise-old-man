import { NameChange } from '../../../prisma';
import newJobManager from '../../../jobs-new/job.manager';

async function onNameChangeSubmitted(nameChange: NameChange) {
  newJobManager.add('ReviewNameChangeJob', { nameChangeId: nameChange.id });
}

export { onNameChangeSubmitted };
