import { Request } from 'express';
import prisma from '../../prisma';
import { Competition } from '../../database/models';
import { BadRequestError, NotFoundError, ServerError } from '../errors';
import * as cryptService from '../services/external/crypt.service';

async function verifyGroupCode(request: Request) {
  const { id } = request.params;
  const { verificationCode } = request.body;

  if (!id) throw new BadRequestError("Parameter 'id' is required.");
  if (!verificationCode) throw new BadRequestError("Parameter 'verificationCode' is required.");

  const group = await prisma.group.findFirst({
    where: { id: Number(id) },
    select: { verificationHash: true }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  const verified = await cryptService.verifyCode(group.verificationHash, String(verificationCode));

  return verified;
}

async function verifyCompetitionCode(competition: Competition, verificationCode: string) {
  const { groupId, verificationHash } = competition;

  let hash = verificationHash;

  // If it is a group competition, compare the code
  // to the group's verification hash instead
  if (groupId) {
    const group = await competition.$get('group', { scope: 'withHash' });
    if (!group) throw new ServerError(`Group of id ${groupId} was not found.`);

    hash = group.verificationHash;
  }

  const verified = await cryptService.verifyCode(hash, verificationCode);
  return verified;
}

export { verifyCompetitionCode, verifyGroupCode };
