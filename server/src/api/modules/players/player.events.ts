import { jobManager, JobType } from '../../../jobs-new';
import { Player } from '../../../prisma';
import { FlaggedPlayerReviewContext } from '../../../utils';
import * as discordService from '../../services/external/discord.service';
import prometheus from '../../services/external/prometheus.service';

async function onPlayerFlagged(player: Player, flaggedContext: FlaggedPlayerReviewContext) {
  await prometheus.trackEffect('dispatchPlayerFlaggedReview', async () => {
    discordService.dispatchPlayerFlaggedReview(player, flaggedContext);
  });
}

async function onPlayerArchived(_player: Player, _previousDisplayName: string) {}

async function onPlayerImported(username: string) {
  jobManager.add(JobType.RECALCULATE_PLAYER_ACHIEVEMENTS, { username });
}

export { onPlayerArchived, onPlayerFlagged, onPlayerImported };
