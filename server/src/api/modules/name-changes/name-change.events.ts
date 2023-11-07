import { NameChange } from '../../../prisma';

async function onNameChangeSubmitted(_nameChange: NameChange) {
  console.log('No auto-reviews during leagues.');
}

export { onNameChangeSubmitted };
