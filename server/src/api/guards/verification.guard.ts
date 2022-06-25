import { Request } from 'express';
import prisma from '../../prisma';
import { BadRequestError, NotFoundError } from '../errors';
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

async function verifyCompetitionCode(request: Request) {
  const { id } = request.params;
  const { verificationCode } = request.body;

  if (!id) throw new BadRequestError("Parameter 'id' is required.");
  if (!verificationCode) throw new BadRequestError("Parameter 'verificationCode' is required.");

  const competition = await prisma.competition.findFirst({
    where: { id: Number(id) },
    select: { verificationHash: true, group: { select: { verificationHash: true } } }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  // If it is a group competition, use the group's code to verify instead
  const hash = competition.group ? competition.group.verificationHash : competition.verificationHash;

  const verified = await cryptService.verifyCode(hash, verificationCode);

  return verified;
}

export { verifyCompetitionCode, verifyGroupCode };
