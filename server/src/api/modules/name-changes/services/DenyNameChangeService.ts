import { z } from 'zod';
import { Metric } from '../../../../utils';
import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import logger from '../../../util/logging';

const denyContextSchema = z
  .object({
    reason: z.literal('manual_review')
  })
  .or(
    z.object({
      reason: z.literal('old_stats_cannot_be_found')
    })
  )
  .or(
    z.object({
      reason: z.literal('new_name_not_on_the_hiscores')
    })
  )
  .or(
    z.object({
      reason: z.literal('negative_gains'),
      negativeGains: z.record(z.nativeEnum(Metric), z.number())
    })
  );

const inputSchema = z.object({
  id: z.number().int().positive(),
  reviewContext: z.optional(denyContextSchema).default({ reason: 'manual_review' })
});

type DenyNameChangeParams = z.infer<typeof inputSchema>;

async function denyNameChange(payload: DenyNameChangeParams): Promise<NameChange> {
  const params = inputSchema.parse(payload);

  const nameChange = await prisma.nameChange.findFirst({
    where: { id: params.id }
  });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  if (nameChange.status !== NameChangeStatus.PENDING) {
    throw new BadRequestError('Name change status must be PENDING');
  }

  const updatedNameChange = await prisma.nameChange.update({
    where: { id: params.id },
    data: {
      resolvedAt: new Date(),
      status: NameChangeStatus.DENIED,
      reviewContext: params.reviewContext
    }
  });

  logger.moderation(
    `[NameChange:${nameChange.id}] Denied ${params.reviewContext.reason}`,
    params.reviewContext
  );

  return updatedNameChange as NameChange;
}

export { denyNameChange };
