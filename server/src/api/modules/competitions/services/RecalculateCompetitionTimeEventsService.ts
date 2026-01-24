import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import ms from 'ms';
import prisma from '../../../../prisma';
import {
  CompetitionTimeEvent,
  CompetitionTimeEventStatus,
  CompetitionTimeEventType
} from '../../../../types';

// 6h and 5min before start, and then on start
const BEFORE_START_OFFSETS = [360, 5, 0];
// 12h, 2h, and 30min before end, and then on end
const BEFORE_END_OFFSETS = [720, 120, 30, 0];

export async function recalculateCompetitionTimeEvents(competitionId: number): AsyncResult<
  true,
  | { code: 'COMPETITION_NOT_FOUND' }
  | { code: 'COMPETITION_END_DATE_BEFORE_START_DATE' }
  | {
      code: 'FAILED_TO_COMMIT_TRANSACTION';
      subError: unknown;
    }
> {
  const competition = await prisma.competition.findFirst({
    where: {
      id: competitionId
    }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  if (competition.endsAt.getTime() < competition.startsAt.getTime()) {
    return errored({ code: 'COMPETITION_END_DATE_BEFORE_START_DATE' });
  }

  const newEvents: Array<Pick<CompetitionTimeEvent, 'type' | 'offsetMinutes' | 'executeAt'>> = [];

  for (const offset of BEFORE_START_OFFSETS) {
    const executeAt = new Date(competition.startsAt.getTime() - offset * 60 * 1000);

    if (executeAt.getTime() <= Date.now()) {
      continue;
    }

    newEvents.push({
      type: CompetitionTimeEventType.BEFORE_START,
      offsetMinutes: offset,
      executeAt
    });
  }

  for (const offset of BEFORE_END_OFFSETS) {
    const executeAt = new Date(competition.endsAt.getTime() - offset * 60 * 1000);

    if (executeAt.getTime() <= Date.now()) {
      continue;
    }

    newEvents.push({
      type: CompetitionTimeEventType.BEFORE_END,
      offsetMinutes: offset,
      executeAt
    });
  }

  // Start from the first 24h cycle (startsAt + 24h)
  let next24hCycle = new Date(competition.startsAt.getTime() + ms('24 hours'));

  // If that's in the past, keep adding 24h until we find one in the future
  while (next24hCycle.getTime() <= Date.now()) {
    next24hCycle = new Date(next24hCycle.getTime() + ms('24 hours'));
  }

  if (next24hCycle.getTime() < competition.endsAt.getTime()) {
    newEvents.push({
      type: CompetitionTimeEventType.DURING,
      offsetMinutes: 24 * 60, // every 24h
      executeAt: next24hCycle
    });
  }

  const transactionResult = await fromPromise(
    prisma.$transaction(async tx => {
      const now = new Date();

      const currentTimeEvents = await tx.competitionTimeEvent.findMany({
        where: {
          competitionId: competition.id,
          status: {
            not: CompetitionTimeEventStatus.CANCELED
          }
        }
      });

      const { toCancel, toCreate } = findDiff(currentTimeEvents, newEvents);

      await tx.competitionTimeEvent.updateMany({
        where: {
          id: {
            in: toCancel.map(event => event.id)
          }
        },
        data: {
          status: CompetitionTimeEventStatus.CANCELED,
          canceledAt: now
        }
      });

      await tx.competitionTimeEvent.createMany({
        data: toCreate.map(event => ({
          ...event,
          competitionId: competition.id,
          createdAt: now
        }))
      });
    })
  );

  if (isErrored(transactionResult)) {
    return errored({
      code: 'FAILED_TO_COMMIT_TRANSACTION',
      subError: transactionResult.error
    });
  }

  return complete(true);
}

function findDiff(
  current: Array<CompetitionTimeEvent>,
  next: Array<Pick<CompetitionTimeEvent, 'type' | 'offsetMinutes' | 'executeAt'>>
) {
  const toCancel: CompetitionTimeEvent[] = [];
  const toCreate: Array<Pick<CompetitionTimeEvent, 'type' | 'offsetMinutes' | 'executeAt'>> = [];

  const currentMap = new Map<string, CompetitionTimeEvent[]>();

  for (const event of current) {
    const key = `${event.type}-${event.offsetMinutes}-${event.executeAt.toISOString()}`;
    currentMap.set(key, [...(currentMap.get(key) ?? []), event]);
  }

  const nextMap = new Map(
    next.map(event => [`${event.type}-${event.offsetMinutes}-${event.executeAt.toISOString()}`, event])
  );

  for (const [key, events] of currentMap) {
    if (!nextMap.has(key)) {
      toCancel.push(...events);
    } else {
      toCancel.push(...events.slice(1)); // cancel any duplicates
    }
  }

  for (const [key, event] of nextMap) {
    if (!currentMap.has(key)) {
      toCreate.push(event);
    }
  }

  return { toCancel, toCreate };
}
