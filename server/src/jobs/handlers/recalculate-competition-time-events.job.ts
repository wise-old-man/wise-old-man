import { isErrored } from '@attio/fetchable';
import { recalculateCompetitionTimeEvents } from '../../api/modules/competitions/services/RecalculateCompetitionTimeEventsService';
import logger from '../../services/logging.service';
import { assertNever } from '../../utils/assert-never.util';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  competitionId: number;
}

export const RecalculateCompetitionTimeEventsJobHandler: JobHandler<Payload> = {
  options: {
    backoff: 30_000,
    attempts: 10
  },

  async execute(payload) {
    const result = await recalculateCompetitionTimeEvents(payload.competitionId);

    if (isErrored(result)) {
      switch (result.error.code) {
        case 'COMPETITION_NOT_FOUND':
        case 'COMPETITION_END_DATE_BEFORE_START_DATE':
          return;
        case 'FAILED_TO_COMMIT_TRANSACTION':
          logger.error('Failed to recalculate competition time events', result);
          throw result.error;
        default:
          assertNever(result.error);
      }
    }
  }
};
