import { NameChange } from '../../../prisma';
import { jobManager, JobType } from '../../jobs';

async function onNameChangeSubmitted(nameChange: NameChange) {
  jobManager.add({
    type: JobType.REVIEW_NAME_CHANGE,
    payload: { id: nameChange.id }
  });
}

export { onNameChangeSubmitted };
