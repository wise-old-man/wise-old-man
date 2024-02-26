import fs from 'fs';

/**
 * This is an extremely hacky script that mashes up some of Prisma's type declarations with my own.
 * I can't simply bundle up all type declarations with rollup because the dts plugin doesn't support namespaces.
 */

const PRIVATE_MODEL_NAMES = [
  'Achievement',
  'Record',
  'Delta',
  'Snapshot',
  'Player',
  'NameChange',
  'GroupSocialLinks'
];

const PRISMA_TYPES_DECLARATION_FILE_PATH = './prisma-models.d.ts';
const BUILD_DECLARATION_FILE_PATH = './dist/index.d.ts';

const prismaTypesContent = fs.readFileSync(PRISMA_TYPES_DECLARATION_FILE_PATH, { encoding: 'utf8' });

let clientTypesContent = fs
  .readFileSync(BUILD_DECLARATION_FILE_PATH, { encoding: 'utf8' })
  .split('\n')
  .splice(2)
  .join('\n');

PRIVATE_MODEL_NAMES.forEach(model => {
  clientTypesContent = clientTypesContent.replaceAll(`${model}$1`, `Prisma_Base_${model}`);
});

const finalContent = prismaTypesContent + '\n' + clientTypesContent;

fs.writeFileSync(BUILD_DECLARATION_FILE_PATH, finalContent);
