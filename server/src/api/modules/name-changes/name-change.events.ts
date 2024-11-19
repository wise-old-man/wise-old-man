import { NameChange } from '../../../prisma';

async function onNameChangeSubmitted(_nameChange: NameChange) {
  // No auto reviews on leagues
}

export { onNameChangeSubmitted };
