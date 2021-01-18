import { NameChange } from '../../database/models';
import * as nameService from '../services/internal/name.service';

async function onNameChangeCreated(nameChange: NameChange) {
  await nameService.autoReview(nameChange.id);
}

export { onNameChangeCreated };
