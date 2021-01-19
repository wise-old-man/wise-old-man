import { NameChange } from '../../database/models';
import * as nameService from '../services/internal/name.service';

async function onNameChangeCreated(nameChange: NameChange) {
  // Delay this action to prevent proccessing too many
  // simoultaneous name changes after a bulk submission
  setTimeout(async () => {
    await nameService.autoReview(nameChange.id);
  }, Math.random() * 120_000);
}

export { onNameChangeCreated };
