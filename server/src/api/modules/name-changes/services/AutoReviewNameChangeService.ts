import { z } from 'zod';
import { Metric, NameChangeDetails } from '../../../../utils';
import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';
import logger from '../../../util/logging';
import * as playerUtils from '../../players/player.utils';
import { approveNameChange } from './ApproveNameChangeService';
import { denyNameChange } from './DenyNameChangeService';
import { fetchNameChangeDetails } from './FetchNameChangeDetailsService';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type AutoReviewNameChangeParams = z.infer<typeof inputSchema>;

async function autoReviewNameChange(payload: AutoReviewNameChangeParams): Promise<void> {
  const params = inputSchema.parse(payload);

  let details: NameChangeDetails;

  try {
    details = await fetchNameChangeDetails({ id: params.id });
  } catch (error) {
    if (error.message === 'Old stats could not be found.') {
      logger.debug(`Denying ${params.id}: Old stats not found`);
      await denyNameChange({
        id: params.id,
        reviewContext: { reason: 'old_stats_cannot_be_found' }
      });
      return;
    }
  }

  if (!details || details.nameChange.status !== NameChangeStatus.PENDING) return;

  const { data, nameChange } = details;
  const { isNewOnHiscores, negativeGains, hoursDiff, ehpDiff, ehbDiff, oldStats } = data;

  // If it's a capitalization change, auto-approve
  if (playerUtils.standardize(nameChange.oldName) === playerUtils.standardize(nameChange.newName)) {
    await approveNameChange({ id: params.id });
    return;
  }

  // If this name change was submitted in a bulk submission, likely via
  // the RL plugin, and most of its "neighbour"/"bundled" name changes
  // have been approved, then let's assume this one is more likely to be legit.
  // For this, we use a modifier to lower the approval requirements.
  const bundleModifier = await getBundleModifier(nameChange);

  // If new name is not on the hiscores
  if (!isNewOnHiscores) {
    logger.debug(`Denying ${params.id}: New name is not on the hiscores`);
    await denyNameChange({
      id: params.id,
      reviewContext: { reason: 'new_name_not_on_the_hiscores' }
    });
    return;
  }

  // If has lost exp/kills/scores, deny request
  if (negativeGains) {
    await denyNameChange({
      id: params.id,
      reviewContext: { reason: 'negative_gains', negativeGains }
    });
    return;
  }

  const baseMaxHours = 504;
  const extraHours = (oldStats.data.skills[Metric.OVERALL].experience / 2_000_000) * 168;

  const allowedTotalLevel = 700 / bundleModifier;
  const allowedEfficiencyDiff = hoursDiff * bundleModifier;
  const allowedHourDiff = (baseMaxHours + extraHours) * bundleModifier;

  // If the transition period is over (3 weeks + 1 week per each 2m exp)
  if (hoursDiff > allowedHourDiff) {
    logger.debug(`Ignoring ${params.id}: Transition period too long`, { allowedHourDiff, hoursDiff });
    return;
  }

  // If has gained too much exp/kills
  if (ehpDiff + ehbDiff > allowedEfficiencyDiff) {
    logger.debug(`Ignoring ${params.id}: Excessive gains`, { allowedEfficiencyDiff });
    return;
  }

  const totalLevel = oldStats.data.skills.overall.level;

  // If is high level enough (high level swaps are harder to fake)
  if (totalLevel < allowedTotalLevel) {
    logger.debug(`Ignoring ${params.id}: Total level too low (${totalLevel} <  ${allowedTotalLevel})`);
    return;
  }

  // All seems to be fine, auto approve
  await approveNameChange({ id: params.id });
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
