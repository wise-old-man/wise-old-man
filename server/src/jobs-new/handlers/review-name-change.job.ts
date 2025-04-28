import * as playerUtils from '../../api/modules/players/player.utils';
import { approveNameChange } from '../../api/modules/name-changes/services/ApproveNameChangeService';
import { denyNameChange } from '../../api/modules/name-changes/services/DenyNameChangeService';
import { fetchNameChangeDetails } from '../../api/modules/name-changes/services/FetchNameChangeDetailsService';
import prisma from '../../prisma';
import { Metric, NameChange, NameChangeDetails, NameChangeStatus, SkipContext } from '../../utils';
import { JobManager } from '../job-manager';
import { Job } from '../job.class';

const BASE_MAX_HOURS = 504;
const BASE_MIN_TOTAL_LEVEL = 700;

interface Payload {
  nameChangeId: number;
}

export class ReviewNameChangeJob extends Job<Payload> {
  constructor(jobManager: JobManager) {
    super(jobManager);

    this.options = {
      rateLimiter: { max: 1, duration: 5000 }
    };
  }

  async execute(payload: Payload) {
    const { nameChangeId } = payload;

    let details: NameChangeDetails | null = null;

    try {
      details = await fetchNameChangeDetails(nameChangeId);
    } catch (error) {
      if (error.message === 'Old stats could not be found.') {
        await denyNameChange(nameChangeId, { reason: 'old_stats_cannot_be_found' });
        return;
      }
    }

    if (!details || !details.data || details.nameChange.status !== NameChangeStatus.PENDING) return;

    const { data, nameChange } = details;
    const { isNewOnHiscores, negativeGains, hoursDiff, ehpDiff, ehbDiff, oldStats } = data;

    // If it's a capitalization change, auto-approve
    if (playerUtils.standardize(nameChange.oldName) === playerUtils.standardize(nameChange.newName)) {
      await approveNameChange(nameChangeId);
      return;
    }

    // If this name change was submitted in a bulk submission, likely via
    // the RL plugin, and most of its "neighbour"/"bundled" name changes
    // have been approved, then let's assume this one is more likely to be legit.
    // For this, we use a modifier to lower the approval requirements.
    const bundleModifier = await getBundleModifier(nameChange);

    // If new name is not on the hiscores
    if (!isNewOnHiscores) {
      await denyNameChange(nameChangeId, { reason: 'new_name_not_on_the_hiscores' });
      return;
    }

    // If has lost exp/kills/scores, deny request
    if (negativeGains) {
      await denyNameChange(nameChangeId, { reason: 'negative_gains', negativeGains });
      return;
    }

    const extraHours = (oldStats.data.skills[Metric.OVERALL].experience / 2_000_000) * 168;

    const allowedTotalLevel = BASE_MIN_TOTAL_LEVEL / bundleModifier;
    const allowedEfficiencyDiff = hoursDiff * bundleModifier;
    const allowedHourDiff = (BASE_MAX_HOURS + extraHours) * bundleModifier;

    // If the transition period is over (3 weeks + 1 week per each 2m exp)
    if (hoursDiff > allowedHourDiff) {
      await skipReview(nameChangeId, {
        reason: 'transition_period_too_long',
        maxHoursDiff: BASE_MAX_HOURS,
        hoursDiff: hoursDiff
      });
      return;
    }

    // If has gained too much exp/kills
    if (ehpDiff + ehbDiff > allowedEfficiencyDiff) {
      await skipReview(nameChangeId, {
        reason: 'excessive_gains',
        ehpDiff,
        ehbDiff,
        hoursDiff
      });
      return;
    }

    const totalLevel = oldStats.data.skills.overall.level;

    // If is high level enough (high level swaps are harder to fake)
    if (totalLevel < allowedTotalLevel) {
      await skipReview(nameChangeId, {
        reason: 'total_level_too_low',
        minTotalLevel: BASE_MIN_TOTAL_LEVEL,
        totalLevel
      });
      return;
    }

    // All seems to be fine, auto approve
    await approveNameChange(nameChangeId);
  }
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

async function skipReview(id: number, skipContext: SkipContext) {
  await prisma.nameChange.update({
    where: { id },
    data: { reviewContext: skipContext }
  });
}
