import { z } from 'zod';
import prisma from '../../../../prisma';
import * as cryptService from '../../../services/external/crypt.service';
import { NotFoundError } from '../../../errors';

const inputSchema = z.object({
  id: z.number().positive()
});

type ResetGroupCodeParams = z.infer<typeof inputSchema>;

async function resetGroupCode(payload: ResetGroupCodeParams): Promise<{ newCode: string }> {
  const params = inputSchema.parse(payload);

  const [code, hash] = await cryptService.generateVerification();

  try {
    await prisma.group.update({
      where: { id: params.id },
      data: { verificationHash: hash }
    });

    return { newCode: code };
  } catch (error) {
    // Failed to find group with that id
    throw new NotFoundError('Group not found.');
  }
}

export { resetGroupCode };
