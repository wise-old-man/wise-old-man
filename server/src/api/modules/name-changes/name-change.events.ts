import { NameChange } from '../../../prisma';
import experimentalJobManager from '../../../jobs/job.manager';
import { ReviewNameChangeJob } from '../../../jobs/instances/ReviewNameChangeJob';

async function onNameChangeSubmitted(nameChange: NameChange) {
  experimentalJobManager.add(new ReviewNameChangeJob(nameChange.id));
}

export { onNameChangeSubmitted };
