import axios from 'axios';
import { NameChange } from '../../../prisma';

async function onNameChangeSubmitted(nameChange: NameChange) {
  // Submit this name on the regular API instead
  await axios.post(`https://api.wiseoldman.net/v2/names`, {
    oldName: nameChange.oldName,
    newName: nameChange.newName
  });
}

export { onNameChangeSubmitted };
