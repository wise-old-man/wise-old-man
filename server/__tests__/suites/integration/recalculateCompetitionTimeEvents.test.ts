import ms from 'ms';
import { recalculateCompetitionTimeEvents } from '../../../src/api/modules/competitions/services/RecalculateCompetitionTimeEventsService';
import prisma from '../../../src/prisma';

import { CompetitionTimeEventStatus, CompetitionTimeEventType } from '../../../src/types';
import { assertComplete, assertErrored, resetDatabase } from '../../utils';

beforeAll(async () => {
  await resetDatabase();
});

beforeEach(async () => {
  await prisma.competitionTimeEvent.deleteMany();
  await prisma.competition.deleteMany();
});

describe('recalculateCompetitionTimeEvents (integration)', () => {
  it('should return COMPETITION_NOT_FOUND if competition does not exist', async () => {
    const result = await recalculateCompetitionTimeEvents(999999);

    assertErrored(result);
    expect(result.error.code).toBe('COMPETITION_NOT_FOUND');
  });

  it('should not create or cancel any events if all are in the past', async () => {
    // Finished 12h ago
    const competition = await prisma.competition.create({
      data: {
        title: 'Past Comp',
        type: 'classic',
        startsAt: new Date(Date.now() - ms('24 hours')),
        endsAt: new Date(Date.now() - ms('12 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });
    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    expect(events.length).toBe(0);
  });

  it('should only schedule future events (ending in 2 days)', async () => {
    const now = new Date();

    // Ending in 2 days, started 1h ago
    const competition = await prisma.competition.create({
      data: {
        title: 'Mixed Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() - ms('1 hour')),
        endsAt: new Date(now.getTime() + ms('2 days')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    expect(events.length).toBe(5);
    expect(events.every(e => e.executeAt > now)).toBe(true);

    // Has one more "during" event
    expect(events.find(e => e.type === CompetitionTimeEventType.DURING)).toMatchObject({
      offsetMinutes: 1440,
      executeAt: new Date(competition.startsAt.getTime() + ms('1 day'))
    });

    // Has all before_end offsets
    const beforeEndOffsets = events
      .filter(e => e.type === CompetitionTimeEventType.BEFORE_END)
      .map(e => e.offsetMinutes)
      .sort((a, b) => a - b);

    expect(beforeEndOffsets).toEqual([0, 30, 120, 720]);
  });

  it('should only schedule future events (ending in 2 hours)', async () => {
    const now = new Date();

    // Ending in 2 hours, started 1h ago
    const competition = await prisma.competition.create({
      data: {
        title: 'Mixed Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() - ms('1 hour')),
        endsAt: new Date(now.getTime() + ms('2 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    expect(events.length).toBe(2);
    expect(events.every(e => e.executeAt > now)).toBe(true);

    // No more "during events"
    expect(events.find(e => e.type === CompetitionTimeEventType.DURING)).toBeUndefined();

    // Only has 2 offsets left
    const beforeEndOffsets = events
      .filter(e => e.type === CompetitionTimeEventType.BEFORE_END)
      .map(e => e.offsetMinutes)
      .sort((a, b) => a - b);

    expect(beforeEndOffsets).toEqual([0, 30]);
  });

  it('should create all BEFORE_START events for future competition', async () => {
    const now = new Date();

    // Starting in 12 hours, ending in 72 hours
    const competition = await prisma.competition.create({
      data: {
        title: 'Future Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('72 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    // Should have: 3 BEFORE_START (360, 5, 0) + 4 BEFORE_END (720, 120, 30, 0) + 1 DURING
    expect(events.length).toBe(8);

    const beforeStartOffsets = events
      .filter(e => e.type === CompetitionTimeEventType.BEFORE_START)
      .map(e => e.offsetMinutes)
      .sort((a, b) => b - a);

    expect(beforeStartOffsets).toEqual([360, 5, 0]);

    expect(events.find(e => e.type === CompetitionTimeEventType.DURING)).toMatchObject({
      offsetMinutes: 1440,
      executeAt: new Date(competition.startsAt.getTime() + ms('1 day'))
    });

    const beforeEndOffsets = events
      .filter(e => e.type === CompetitionTimeEventType.BEFORE_END)
      .map(e => e.offsetMinutes)
      .sort((a, b) => a - b);

    expect(beforeEndOffsets).toEqual([0, 30, 120, 720]);
  });

  it('should not create DURING event for competition shorter than 24h', async () => {
    const now = new Date();

    // Starting in 2 hours, ending in 20 hours (18h duration)
    const competition = await prisma.competition.create({
      data: {
        title: 'Short Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('2 hours')),
        endsAt: new Date(now.getTime() + ms('20 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    expect(events.filter(e => e.type === CompetitionTimeEventType.DURING).length).toBe(0);
  });

  it('should create DURING event exactly at 24h mark for long competition', async () => {
    const now = new Date();

    // Starting in 2 hours, ending in 50 hours
    const competition = await prisma.competition.create({
      data: {
        title: 'Long Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('2 hours')),
        endsAt: new Date(now.getTime() + ms('50 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    const duringEvent = events.find(e => e.type === CompetitionTimeEventType.DURING);
    expect(duringEvent).toBeDefined();
    expect(duringEvent!.offsetMinutes).toBe(1440); // 24 * 60
    expect(duringEvent!.executeAt.getTime()).toBe(competition.startsAt.getTime() + ms('24 hours'));
  });

  it('should cancel existing events and create new ones when competition is rescheduled', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Rescheduled Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('36 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    // First calculation
    await recalculateCompetitionTimeEvents(competition.id);

    const initialEvents = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id, canceledAt: null }
    });
    expect(initialEvents.length).toBeGreaterThan(0);

    // Reschedule competition to different time
    await prisma.competition.update({
      where: { id: competition.id },
      data: {
        startsAt: new Date(now.getTime() + ms('24 hours')),
        endsAt: new Date(now.getTime() + ms('48 hours'))
      }
    });

    // Second calculation
    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const canceledEvents = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id, canceledAt: { not: null } }
    });

    const activeEvents = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id, canceledAt: null }
    });

    expect(canceledEvents.length).toBe(initialEvents.length);
    expect(activeEvents.length).toBeGreaterThan(0);
    expect(activeEvents.every(e => e.createdAt > initialEvents[0].createdAt)).toBe(true);
  });

  it('should not cancel or create events if nothing changed', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Stable Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('36 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    // First calculation
    await recalculateCompetitionTimeEvents(competition.id);

    const initialEvents = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    // Second calculation without changes
    await recalculateCompetitionTimeEvents(competition.id);

    const finalEvents = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    expect(finalEvents.length).toBe(initialEvents.length);
    expect(finalEvents.every(e => e.canceledAt === null)).toBe(true);
  });

  it('should handle competition ending exactly at 24h after start', async () => {
    const now = new Date();

    // Exactly 24h duration
    const competition = await prisma.competition.create({
      data: {
        title: 'Exactly 24h Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('2 hours')),
        endsAt: new Date(now.getTime() + ms('26 hours')), // 24h after start
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    // DURING event should NOT be created since next24hCycle would be >= endsAt
    const duringEvents = events.filter(e => e.type === CompetitionTimeEventType.DURING);
    expect(duringEvents.length).toBe(0);
  });

  it('should only include BEFORE_END event at 0 offset when competition ends in 10 minutes', async () => {
    const now = new Date();

    // Ending in 10 minutes
    const competition = await prisma.competition.create({
      data: {
        title: 'Ending Soon Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() - ms('1 hour')),
        endsAt: new Date(now.getTime() + ms('10 minutes')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(CompetitionTimeEventType.BEFORE_END);
    expect(events[0].offsetMinutes).toBe(0);
  });

  it('should handle competition starting exactly now', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Starting Now Comp',
        type: 'classic',
        startsAt: now,
        endsAt: new Date(now.getTime() + ms('30 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const events = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    // Should not have BEFORE_START with offset 0 since executeAt would be exactly now
    const beforeStartEvents = events.filter(e => e.type === CompetitionTimeEventType.BEFORE_START);
    expect(beforeStartEvents.length).toBe(0);
  });

  it('should only keep events that were already canceled when recalculating', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Comp with Canceled',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('36 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    // Create a manually canceled event
    await prisma.competitionTimeEvent.create({
      data: {
        competitionId: competition.id,
        type: CompetitionTimeEventType.BEFORE_START,
        offsetMinutes: 360,
        executeAt: new Date(now.getTime() + ms('6 hours')),
        status: CompetitionTimeEventStatus.CANCELED,
        canceledAt: new Date(),
        createdAt: new Date()
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const allEvents = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id }
    });

    const canceledEvents = allEvents.filter(e => e.canceledAt !== null);

    // The manually canceled event should still exist
    expect(canceledEvents.length).toBe(1);
  });

  it('should not create any events when competition starts after it ends', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Invalid Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('24 hours')),
        endsAt: new Date(now.getTime() + ms('12 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertErrored(result);

    expect(result.error.code).toBe('COMPETITION_END_DATE_BEFORE_START_DATE');
  });

  it('should cancel duplicate active events with identical timing', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Duplicate Event Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('36 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    const executeAt = new Date(competition.startsAt.getTime() - ms('6 hours'));

    await prisma.competitionTimeEvent.createMany({
      data: [
        {
          competitionId: competition.id,
          type: CompetitionTimeEventType.BEFORE_START,
          offsetMinutes: 360,
          executeAt,
          status: CompetitionTimeEventStatus.WAITING,
          createdAt: now
        },
        {
          competitionId: competition.id,
          type: CompetitionTimeEventType.BEFORE_START,
          offsetMinutes: 360,
          executeAt,
          status: CompetitionTimeEventStatus.WAITING,
          createdAt: now
        }
      ]
    });

    await recalculateCompetitionTimeEvents(competition.id);

    const active = await prisma.competitionTimeEvent.findMany({
      where: {
        competitionId: competition.id,
        type: CompetitionTimeEventType.BEFORE_START,
        offsetMinutes: 360,
        canceledAt: null
      }
    });

    expect(active.length).toBe(1);
  });

  it('should only cancel and recreate events that actually change', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Partial Shift Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('72 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    // Shift start date by +5 minutes
    await prisma.competition.update({
      where: { id: competition.id },
      data: {
        startsAt: new Date(competition.startsAt.getTime() + ms('5 minutes'))
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    const canceled = await prisma.competitionTimeEvent.findMany({
      where: {
        competitionId: competition.id,
        canceledAt: { not: null }
      }
    });

    expect(canceled.length).toBe(4);
    expect(canceled.filter(e => e.type === CompetitionTimeEventType.BEFORE_START).length).toBe(3);
    expect(canceled.filter(e => e.type === CompetitionTimeEventType.DURING).length).toBe(1);
  });

  it('should cancel and recreate start-anchored events when start date shifts backward', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Start Backward Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('24 hours')),
        endsAt: new Date(now.getTime() + ms('72 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    // shift start BACK by 1 hour
    await prisma.competition.update({
      where: { id: competition.id },
      data: {
        startsAt: new Date(competition.startsAt.getTime() - ms('1 hour'))
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    const canceled = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id, canceledAt: { not: null } }
    });

    expect(canceled.filter(e => e.type === CompetitionTimeEventType.BEFORE_START).length).toBeGreaterThan(0);
    expect(canceled.filter(e => e.type === CompetitionTimeEventType.DURING).length).toBe(1);
  });

  it('should only recalc BEFORE_END events when end date shifts forward', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'End Forward Only Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('36 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    // shift end forward by 2 hours
    await prisma.competition.update({
      where: { id: competition.id },
      data: {
        endsAt: new Date(competition.endsAt.getTime() + ms('2 hours'))
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    const canceled = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id, canceledAt: { not: null } }
    });

    expect(canceled.every(e => e.type === CompetitionTimeEventType.BEFORE_END)).toBe(true);

    const activeDuring = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id, type: CompetitionTimeEventType.DURING, canceledAt: null }
    });
    expect(activeDuring.length).toBe(1);
  });

  it('should recalc BEFORE_END but keep DURING when end date shifts backward but remains >24h', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'End Backward >24h Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('50 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    // shift end backward by 6 hours (still > 24h from start)
    await prisma.competition.update({
      where: { id: competition.id },
      data: {
        endsAt: new Date(competition.endsAt.getTime() - ms('6 hours'))
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    const canceledDuring = await prisma.competitionTimeEvent.findMany({
      where: {
        competitionId: competition.id,
        type: CompetitionTimeEventType.DURING,
        canceledAt: { not: null }
      }
    });
    expect(canceledDuring.length).toBe(0); // DURING still valid

    const canceledBeforeEnd = await prisma.competitionTimeEvent.findMany({
      where: {
        competitionId: competition.id,
        type: CompetitionTimeEventType.BEFORE_END,
        canceledAt: { not: null }
      }
    });
    expect(canceledBeforeEnd.length).toBeGreaterThan(0);
  });

  it('should cancel DURING event when end date shifts backward crossing <24h from start', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'End Backward <24h Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('50 hours')), // initial >24h
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    // shift end backward to < 24h from start
    await prisma.competition.update({
      where: { id: competition.id },
      data: {
        endsAt: new Date(competition.startsAt.getTime() + ms('23 hours'))
      }
    });

    await recalculateCompetitionTimeEvents(competition.id);

    const canceledDuring = await prisma.competitionTimeEvent.findMany({
      where: {
        competitionId: competition.id,
        type: CompetitionTimeEventType.DURING,
        canceledAt: { not: null }
      }
    });
    expect(canceledDuring.length).toBe(1);

    const activeDuring = await prisma.competitionTimeEvent.findMany({
      where: { competitionId: competition.id, type: CompetitionTimeEventType.DURING, canceledAt: null }
    });
    expect(activeDuring.length).toBe(0);
  });

  it('should not cancel events that have already been completed', async () => {
    const now = new Date();

    const competition = await prisma.competition.create({
      data: {
        title: 'Completed Event Comp',
        type: 'classic',
        startsAt: new Date(now.getTime() + ms('12 hours')),
        endsAt: new Date(now.getTime() + ms('36 hours')),
        score: 0,
        visible: true,
        verificationHash: 'hash'
      }
    });

    // Manually create an event that is already COMPLETED
    // e.g., a "BEFORE_START" event that supposedly already ran
    const completedEvent = await prisma.competitionTimeEvent.create({
      data: {
        competitionId: competition.id,
        type: CompetitionTimeEventType.BEFORE_START,
        offsetMinutes: 360,
        executeAt: new Date(now.getTime() - ms('1 hour')), // In the past
        status: CompetitionTimeEventStatus.COMPLETED,
        createdAt: new Date(now.getTime() - ms('2 hours'))
      }
    });

    // Reschedule the competition to trigger a full recalculation logic
    await prisma.competition.update({
      where: { id: competition.id },
      data: {
        startsAt: new Date(now.getTime() + ms('24 hours'))
      }
    });

    const result = await recalculateCompetitionTimeEvents(competition.id);
    assertComplete(result);

    const eventAfterRecalc = await prisma.competitionTimeEvent.findUnique({
      where: { id: completedEvent.id }
    });

    expect(eventAfterRecalc?.status).toBe(CompetitionTimeEventStatus.COMPLETED);
    expect(eventAfterRecalc?.canceledAt).toBeNull();

    // Ensure new events were still created for the new schedule
    const activeEvents = await prisma.competitionTimeEvent.findMany({
      where: {
        competitionId: competition.id,
        status: CompetitionTimeEventStatus.WAITING
      }
    });
    expect(activeEvents.length).toBeGreaterThan(0);
  });
});
