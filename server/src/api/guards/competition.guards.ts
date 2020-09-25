import { Competition } from '../../database/models';
import { ServerError } from '../errors';
import * as cryptService from '../services/external/crypt.service';

async function verifyCompetitionCode(competition: Competition, verificationCode: string) {
  const { groupId, verificationHash } = competition;

  let hash = verificationHash;

  // If it is a group competition, compare the code
  // to the group's verification hash instead
  if (groupId) {
    const group = await competition.$get('group');
    if (!group) throw new ServerError(`Group of id ${groupId} was not found.`);

    hash = group.verificationHash;
  }

  const verified = await cryptService.verifyCode(hash, verificationCode);
  return verified;
}

export { verifyCompetitionCode };
