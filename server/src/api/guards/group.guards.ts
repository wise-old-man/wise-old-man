import { Group } from '../../database/models';
import * as cryptService from '../services/external/crypt.service';

async function verifyGroupCode(group: Group, verificationCode: string) {
  const verified = await cryptService.verifyCode(group.verificationHash, verificationCode);
  return verified;
}

export { verifyGroupCode };
