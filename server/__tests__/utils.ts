import prisma from '../src/prisma';

export async function resetDatabase() {
  const modelNames = Object.keys(prisma).filter(k => !k.startsWith('_'));
  await Promise.all(modelNames.map(async model => prisma[model].deleteMany()));
}
