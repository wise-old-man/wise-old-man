/**
 * This is an extremely hacky script that mashes up some of Prisma's type declarations with my own.
 * I can't simply bundle up all type declarations with rollup because the dts plugin doesn't support namespaces.
 */

const fs = require('fs');

const PRIVATE_MODEL_NAMES = ['Achievement', 'Record', 'Delta', 'Snapshot', 'Player'];

const START_TOKEN = 'export type Achievement';
const END_TOKEN = ' * Enums';

const PRISMA_DECLARATION_FILE_PATH = '../server/node_modules/.prisma/client/index.d.ts';
const BUILD_DECLARATION_FILE_PATH = './dist/index.d.ts';

const buildContent = fs.readFileSync(BUILD_DECLARATION_FILE_PATH, { encoding: 'utf8' });
const parsedBuildContent = buildContent.split('\n').splice(2).join('\n');

const prismaContent = fs.readFileSync(PRISMA_DECLARATION_FILE_PATH, { encoding: 'utf8' });
const parsedPrismaContent = prismaContent
  .substring(prismaContent.indexOf(START_TOKEN), prismaContent.indexOf(END_TOKEN))
  .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
  .replace('/**', '')
  .split('\n')
  .map(line => {
    const privateModelMatch = PRIVATE_MODEL_NAMES.find(model => line.includes(`export type ${model} =`));

    if (privateModelMatch) return line.replace(privateModelMatch, `${privateModelMatch}$1`);
    return line;
  })
  .join('\n');

const finalContent = `${parsedPrismaContent}\n${parsedBuildContent}`;

fs.writeFileSync(BUILD_DECLARATION_FILE_PATH, finalContent);
