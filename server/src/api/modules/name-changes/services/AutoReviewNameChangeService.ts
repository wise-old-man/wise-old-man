import { z } from 'zod';
import { getLevel } from '@wise-old-man/utils';
import prisma, { MetricEnum, NameChange, NameChangeStatus, Skills } from '../../../../prisma';
import * as nameChangeServices from '../name-change.services';
import * as playerUtils from '../../players/player.utils';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type AutoReviewNameChangeParams = z.infer<typeof inputSchema>;

async function autoReviewNameChange(payload: AutoReviewNameChangeParams): Promise<void> {
  const params = inputSchema.parse(payload);

  let details;

  try {
    details = await nameChangeServices.fetchNameChangeDetails({ id: params.id });
  } catch (error) {
    if (error.message === 'Old stats could not be found.') {
      await nameChangeServices.denyNameChange({ id: params.id });
      return;
    }
  }

  if (!details || details.nameChange.status !== NameChangeStatus.PENDING) return;

  const { data, nameChange } = details;
  const { isNewOnHiscores, hasNegativeGains, hoursDiff, ehpDiff, ehbDiff, oldStats } = data;

  // If it's a capitalization change, auto-approve
  if (playerUtils.standardize(nameChange.oldName) === playerUtils.standardize(nameChange.newName)) {
    await nameChangeServices.approveNameChange({ id: params.id });
    return;
  }

  // If this name change was submitted in a bulk submission, likely via
  // the RL plugin, and most of its "neighbour"/"bundled" name changes
  // have been approved, then let's assume this one is more likely to be legit.
  // For this, we use a modifier to lower the approval requirements.
  const bundleModifier = await getBundleModifier(nameChange);

  // If new name is not on the hiscores
  if (!isNewOnHiscores) {
    await nameChangeServices.denyNameChange({ id: params.id });
    return;
  }

  // If has lost exp/kills/scores, deny request
  if (hasNegativeGains) {
    await nameChangeServices.denyNameChange({ id: params.id });
    return;
  }

  const baseMaxHours = 504;
  const extraHours = (oldStats[MetricEnum.OVERALL].experience / 2_000_000) * 168;

  // If the transition period is over (3 weeks + 1 week per each 2m exp)
  if (hoursDiff > (baseMaxHours + extraHours) * bundleModifier) {
    return;
  }

  // If has gained too much exp/kills
  if (ehpDiff + ehbDiff > hoursDiff * bundleModifier) {
    return;
  }

  const totalLevel = Skills.filter(s => s !== MetricEnum.OVERALL)
    .map(s => getLevel(oldStats[s].experience))
    .reduce((acc, cur) => acc + cur);

  // If is high level enough (high level swaps are harder to fake)
  if (totalLevel < 700 / bundleModifier) {
    return;
  }

  // All seems to be fine, auto approve
  await nameChangeServices.approveNameChange({ id: params.id });
}

/**
 * Finds any neighbouring name changes (submitted around the same time),
 * This is useful information, as the lower the date gap is between submissions,
 * the more likely they have actually been submitted in bulk.
 */
async function findAllBundled(id: number, createdAt: Date) {
  const DATE_GAP_MS = 500;

  const minDate = new Date(createdAt.getTime() - DATE_GAP_MS / 2);
  const maxDate = new Date(createdAt.getTime() + DATE_GAP_MS / 2);

  const nameChanges = await prisma.nameChange.findMany({
    where: {
      id: { not: id },
      createdAt: {
        gte: minDate,
        lte: maxDate
      }
    },
    take: 50
  });

  return nameChanges;
}

/**
 * Checks a name change for it's neighbours, to decide if it
 * should have a boost in approval rate due to having been submitted in bulk.
 * (Bulk submissions are more likely legit, as they were likely submitted via RL plugin)
 */
async function getBundleModifier(nameChange: NameChange): Promise<number> {
  const REGULAR_MODIFIER = 1;
  const BOOSTED_MODIFIER = 2;

  const neighbours = await findAllBundled(nameChange.id, nameChange.createdAt);

  if (!neighbours || neighbours.length === 0) {
    return REGULAR_MODIFIER;
  }

  const approvedCount = neighbours.filter(n => n.status === NameChangeStatus.APPROVED).length;
  const approvedRate = approvedCount / neighbours.length;

  return approvedRate >= 0.5 ? BOOSTED_MODIFIER : REGULAR_MODIFIER;
}

export { autoReviewNameChange };
