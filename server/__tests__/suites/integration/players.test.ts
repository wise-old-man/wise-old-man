import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import supertest from 'supertest';
import APIInstance from '../../../src/api';
import { eventEmitter } from '../../../src/api/events';
import * as GroupMembersJoinedEvent from '../../../src/api/events/handlers/group-members-joined.event';
import * as GroupMembersLeftEvent from '../../../src/api/events/handlers/group-members-left.event';
import * as PlayerArchivedEvent from '../../../src/api/events/handlers/player-archived.event';
import * as PlayerFlaggedEvent from '../../../src/api/events/handlers/player-flagged.event';
import * as PlayerTypeChangedEvent from '../../../src/api/events/handlers/player-type-changed.event';
import * as PlayerUpdatedEvent from '../../../src/api/events/handlers/player-updated.event';
import { getPlayerEfficiencyMap } from '../../../src/api/modules/efficiency/efficiency.utils';
import * as playerUtils from '../../../src/api/modules/players/player.utils';
import { findOrCreatePlayers } from '../../../src/api/modules/players/services/FindOrCreatePlayersService';
import { reviewFlaggedPlayer } from '../../../src/api/modules/players/services/ReviewFlaggedPlayerService';
import { setUpdateCooldown } from '../../../src/api/modules/players/services/UpdatePlayerService';
import { buildHiscoresSnapshot } from '../../../src/api/modules/snapshots/services/BuildHiscoresSnapshot';
import { formatSnapshotResponse } from '../../../src/api/responses';
import prisma from '../../../src/prisma';
import { HiscoresDataSchema } from '../../../src/services/jagex.service';
import { buildCompoundRedisKey, redisClient } from '../../../src/services/redis.service';
import { PlayerAnnotationType, PlayerStatus, PlayerType } from '../../../src/types';
import {
  emptyHiscoresData,
  modifyRawHiscoresData,
  readFile,
  registerHiscoresMock,
  resetDatabase,
  sleep
} from '../../utils';

const api = supertest(new APIInstance().init().express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const groupMembersLeftEvent = jest.spyOn(GroupMembersLeftEvent, 'handler');
const groupMembersJoinedEvent = jest.spyOn(GroupMembersJoinedEvent, 'handler');

const playerArchivedEvent = jest.spyOn(PlayerArchivedEvent, 'handler');
const playerFlaggedEvent = jest.spyOn(PlayerFlaggedEvent, 'handler');
const playerUpdatedEvent = jest.spyOn(PlayerUpdatedEvent, 'handler');
const playerTypeChangedEvent = jest.spyOn(PlayerTypeChangedEvent, 'handler');

const globalData = {
  hiscoresRawData: ''
};

beforeEach(() => {
  jest.resetAllMocks();

  // re-init the event emitter to re-attach the mocked event handlers
  eventEmitter.init();
});

beforeAll(async () => {
  eventEmitter.init();
  await resetDatabase();
  await redisClient.flushall();

  globalData.hiscoresRawData = await readFile(`${__dirname}/../../data/hiscores/psikoi_hiscores.json`);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(() => {
  jest.useRealTimers();
  axiosMock.reset();
  redisClient.quit();
});

describe('Player API', () => {
  describe('1. Tracking', () => {
    it('should not track player (invalid characters)', async () => {
      const response = await api.post(`/players/wow$~#`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Validation error: USERNAME_HAS_SPECIAL_CHARACTERS');

      expect(playerUpdatedEvent).not.toHaveBeenCalled();
    });

    it('should not track player (lengthy username)', async () => {
      const response = await api.post(`/players/ALongUsername`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Validation error: USERNAME_TOO_LONG');

      expect(playerUpdatedEvent).not.toHaveBeenCalled();
    });

    it('should not track player (hiscores failed)', async () => {
      // Mock the hiscores to fail
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404, rawData: '' }
      });

      const response = await api.post(`/players/enrique`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Failed to load hiscores: Player not found.');

      expect(playerUpdatedEvent).not.toHaveBeenCalled();

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });
    });

    it('should not track player (not found on the hiscores)', async () => {
      // Mock the hiscores to fail
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404, rawData: '' }
      });

      const firstResponse = await api.post(`/players/toby`);
      expect(firstResponse.status).toBe(400);
      expect(firstResponse.body.message).toMatch('Failed to load hiscores: Player not found.');

      expect(playerUpdatedEvent).not.toHaveBeenCalled();

      // this player failed to be tracked, and their type remains "unknown"
      // therefor, we should allow them to be tracked again without waiting 60s
      const secondResponse = await api.post(`/players/toby`);
      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.message).toMatch('Failed to load hiscores: Player not found.');

      expect(playerUpdatedEvent).not.toHaveBeenCalled();

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // this player failed to be tracked, and their type remains "unknown"
      // therefor, we should allow them to be tracked again without waiting 60s
      const thirdResponse = await api.post(`/players/toby`);
      expect(thirdResponse.status).toBe(200);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'toby',
          hasChanged: true
        })
      );
    });

    it("shouldn't review player type on 400 (unknown type)", async () => {
      // Mock the hiscores to fail
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404, rawData: '' }
      });

      const response = await api.post(`/players/alanec`);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Failed to load hiscores: Player not found.');

      // this player has "unknown" type, shouldn't be reviewed on 400 (null cooldown = no review)
      expect(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'alanec'))).toBeNull();

      expect(playerUpdatedEvent).not.toHaveBeenCalled();
    });

    it("shouldn't review player type on 400 (regular type)", async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const firstResponse = await api.post(`/players/aluminoti`);
      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.type).toBe('regular');

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'aluminoti',
          hasChanged: true
        })
      );

      expect(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'aluminoti'))).toBeNull();

      playerUpdatedEvent.mockClear();

      // Mock the hiscores to fail
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404, rawData: '' }
      });

      const secondResponse = await api.post(`/players/aluminoti`);
      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.message).toMatch('Failed to load hiscores: Player not found.');

      expect(playerUpdatedEvent).not.toHaveBeenCalled();
      // this player has "regular" type, shouldn't be reviewed on 400 (null cooldown = no review)
      expect(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'aluminoti'))).toBeNull();
    });

    it("shouldn't review player type on 400 (ironman, but has cooldown)", async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const firstResponse = await api.post(`/players/tony_stark`);
      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.type).toBe('ironman');

      expect(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'tony stark'))).toBeNull();

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'tony stark',
          hasChanged: true
        })
      );

      playerUpdatedEvent.mockClear();

      const currentTimestamp = Date.now();

      // Manually set a review cooldown for this username
      await redisClient.set(
        buildCompoundRedisKey('cd', 'PlayerTypeReview', 'tony stark'),
        currentTimestamp,
        'PX',
        604_800_000
      );

      // Mock the hiscores to fail for ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const secondResponse = await api.post(`/players/tony_stark`);
      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.message).toMatch('Failed to load hiscores: Player not found.');

      // this player has "ironman" type, but has been reviewed recently, so they shouldn't be reviewed on 400
      // if the cooldown timestamp is the same as the previous one, then it didn't get reviewed again
      expect(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'tony stark'))).not.toBe(
        currentTimestamp
      );

      expect(playerUpdatedEvent).not.toHaveBeenCalled();
    });

    it('should review player type on 400 (no change)', async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const firstResponse = await api.post(`/players/ash`);
      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.type).toBe('ironman');

      expect(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'ash'))).toBeNull();

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'ash',
          hasChanged: true
        })
      );

      playerUpdatedEvent.mockClear();

      // Mock the hiscores to fail for every type
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404 },
        [PlayerType.IRONMAN]: { statusCode: 404 },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const secondResponse = await api.post(`/players/ash`);
      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.message).toMatch('Failed to load hiscores: Player not found.');

      // failed to review (null cooldown = no review)
      expect(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'ash'))).toBeNull();
      expect(playerUpdatedEvent).not.toHaveBeenCalled();
    });

    it('should review player type on 400 (changed type)', async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const firstResponse = await api.post(`/players/peter_parker`);
      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.type).toBe('ironman');

      // (null cooldown = no review)
      expect(
        await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'peter parker'))
      ).toBeNull();

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'peter parker',
          hasChanged: true
        })
      );

      playerUpdatedEvent.mockClear();

      // Mock the hiscores to fail for ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const secondResponse = await api.post(`/players/peter_parker`);
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.type).toBe('regular');

      // non-null cooldown = successfully reviewed
      expect(
        await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'peter parker'))
      ).not.toBeNull();

      expect(playerTypeChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'peter parker',
          previousType: 'ironman',
          newType: 'regular'
        })
      );

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'peter parker',
          hasChanged: false
        })
      );
    });

    it('should track player', async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/ PSIKOI_ `);

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        username: 'psikoi',
        displayName: 'PSIKOI',
        build: 'main',
        type: 'regular',
        lastImportedAt: null
      });

      // Using the test "main" rates, we should get this number for regular accs
      expect(response.body.ehp).toBeCloseTo(665.07587, 4);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'psikoi',
          hasChanged: true
        })
      );

      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // updated under a second ago
      expect(new Date(response.body.registeredAt).getTime()).toBeGreaterThan(Date.now() - 1000); // registered under a second ago
      expect(new Date(response.body.lastChangedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // changed under a second ago

      expect(response.body.latestSnapshot).not.toBeNull();

      expect(response.body.updatedAt).toBe(response.body.latestSnapshot.createdAt);
      expect(response.body.lastChangedAt).toBe(response.body.latestSnapshot.createdAt);

      expect(response.body.ehp).toBe(response.body.latestSnapshot.data.computed.ehp.value);
      expect(response.body.ehb).toBe(response.body.latestSnapshot.data.computed.ehb.value);

      // This is a new player, so we shouldn't be reviewing their type yet
      const firstTypeReviewCooldown = await redisClient.get(
        buildCompoundRedisKey('cd', 'PlayerTypeReview', 'psikoi')
      );

      expect(firstTypeReviewCooldown).toBeNull();

      // Track again, stats shouldn't have changed
      await api.post(`/players/ PSIKOI_ `);

      expect(playerUpdatedEvent).toHaveBeenCalledTimes(2);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'psikoi',
          hasChanged: false
        })
      );

      // No longer a new player, but they are a regular player, so we shouldn't be reviewing their type
      const secondTypeReviewCooldown = await redisClient.get(
        buildCompoundRedisKey('cd', 'PlayerTypeReview', 'psikoi')
      );

      expect(secondTypeReviewCooldown).toBeNull();
    });

    it('should track player (1 def)', async () => {
      const data1Def = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Defence', value: 0 } // 1 defence
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: data1Def },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseDef1 = await api.post(`/players/def1`);

      expect(responseDef1.status).toBe(201);
      expect(responseDef1.body.build).toBe('def1');
      expect(responseDef1.body.latestSnapshot.data.skills.defence.experience).toBe(0);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'def1',
          hasChanged: true
        })
      );
    });

    it('should track player (zerker)', async () => {
      const dataZerker = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Defence', value: 61_512 } // 45 defence
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: dataZerker },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseZerker = await api.post(`/players/zerker`);

      expect(responseZerker.status).toBe(201);
      expect(responseZerker.body.build).toBe('zerker');
      expect(responseZerker.body.latestSnapshot.data.skills.defence.experience).toBe(61_512);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'zerker',
          hasChanged: true
        })
      );
    });

    it('should track player (10hp)', async () => {
      const data10HP = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Hitpoints', value: 1154 } // 10 Hitpoints
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: data10HP },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response10HP = await api.post(`/players/hp10`);

      expect(response10HP.status).toBe(201);
      expect(response10HP.body.build).toBe('hp10');
      expect(response10HP.body.latestSnapshot.data.skills.hitpoints.experience).toBe(1154);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'hp10',
          hasChanged: true
        })
      );
    });

    it('should track player (lvl3)', async () => {
      const dataLvl3 = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Attack', value: 0 },
        { hiscoresMetricName: 'Strength', value: 0 },
        { hiscoresMetricName: 'Defence', value: 0 },
        { hiscoresMetricName: 'Hitpoints', value: 1154 },
        { hiscoresMetricName: 'Prayer', value: 0 },
        { hiscoresMetricName: 'Ranged', value: 0 },
        { hiscoresMetricName: 'Magic', value: 0 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: dataLvl3 },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseLvl3 = await api.post(`/players/lvl3`);

      expect(responseLvl3.status).toBe(201);
      expect(responseLvl3.body.build).toBe('lvl3');
      expect(responseLvl3.body.latestSnapshot.data.skills.hitpoints.experience).toBe(1154);
      expect(responseLvl3.body.latestSnapshot.data.skills.prayer.experience).toBe(0);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'lvl3',
          hasChanged: true
        })
      );
    });

    it('should track player (f2p)', async () => {
      const dataF2P = modifyRawHiscoresData(emptyHiscoresData(globalData.hiscoresRawData), [
        { hiscoresMetricName: 'Attack', value: 1000 },
        { hiscoresMetricName: 'Magic', value: 1000 },
        { hiscoresMetricName: 'Cooking', value: 1000 },
        { hiscoresMetricName: 'Woodcutting', value: 2000 },
        { hiscoresMetricName: 'Bryophyta', value: 10 },
        { hiscoresMetricName: 'Obor', value: 10 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: dataF2P },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseF2P = await api.post(`/players/f2p`);

      expect(responseF2P.status).toBe(201);
      expect(responseF2P.body.build).toBe('f2p');
      expect(responseF2P.body.latestSnapshot.data.bosses.bryophyta.kills).toBe(10);
      expect(responseF2P.body.latestSnapshot.data.skills.agility.experience).toBe(0);

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'f2p',
          hasChanged: true
        })
      );
    });

    it('should track player (f2p & lvl3)', async () => {
      const dataF2P = modifyRawHiscoresData(emptyHiscoresData(globalData.hiscoresRawData), [
        { hiscoresMetricName: 'Cooking', value: 1000 },
        { hiscoresMetricName: 'Woodcutting', value: 2000 },
        { hiscoresMetricName: 'Bryophyta', value: 10 },
        { hiscoresMetricName: 'Obor', value: 10 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: dataF2P },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseF2PLvl3 = await api.post(`/players/f2p_lvl3`);

      expect(responseF2PLvl3.status).toBe(201);
      expect(responseF2PLvl3.body.build).toBe('f2p_lvl3');

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'f2p lvl3',
          hasChanged: true
        })
      );
    });

    it('should track player (ironman)', async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const response = await api.post(`/players/Enriath`);

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        username: 'enriath',
        displayName: 'Enriath',
        build: 'main',
        type: 'ironman'
      });

      // IM rates should have been used, so the output EHP should be different than the one
      // calculate for the regular player (Psikoi)
      expect(response.body.ehp).not.toBeCloseTo(694.4541800000006, 4);
      expect(response.body.ehp).toBeCloseTo(1260.57215, 4);

      expect(response.body.latestSnapshot).not.toBeNull();

      expect(playerUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'enriath',
          hasChanged: true
        })
      );

      // This is a new player, so we shouldn't be reviewing their type yet
      const firstUpdateCooldown = await redisClient.get(
        buildCompoundRedisKey('cd', 'PlayerTypeReview', 'enriath')
      );

      expect(firstUpdateCooldown).toBeNull();

      // Track again, no stats have changed
      await api.post(`/players/enriath`);

      // This is no longer a new player AND they're an ironman AND their stats haven't changed
      // so their type should be reviewed
      const secondUpdateCooldown = await redisClient.get(
        buildCompoundRedisKey('cd', 'PlayerTypeReview', 'enriath')
      );

      expect(secondUpdateCooldown).not.toBeNull();

      // Track again, no stats have changed
      await api.post(`/players/enriath`);

      // This player was recently reviewed, and since the current timestamp gets stored on Redis
      // if they were to get reviewed again, their timestamp would be greater than the one stored
      const thirdUpdateCooldown = await redisClient.get(
        buildCompoundRedisKey('cd', 'PlayerTypeReview', 'enriath')
      );

      expect(thirdUpdateCooldown).toBe(secondUpdateCooldown);
    });

    it('should track and review type', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Overall', value: 350_192_115 } // overall exp increased by 50m
      ]);

      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      // The player has de-ironed, but their review cooldown isn't up yet
      const firstResponse = await api.post(`/players/Enriath`);

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body).toMatchObject({ username: 'enriath', type: 'ironman' });

      // Manually clear the cooldown
      await redisClient.del(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'enriath'));

      const secondResponse = await api.post(`/players/Enriath`);

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body).toMatchObject({ username: 'enriath', type: 'regular' }); // type changed to regular

      const cooldown = await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', 'enriath'));
      expect(cooldown).not.toBeNull();

      // Revert the hiscores mocking back to "regular" player type
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });
    });

    it('should not track player (too soon)', async () => {
      // This cooldown is set to 0 during testing by default
      setUpdateCooldown(60);

      const response = await api.post(`/players/enriath`);

      expect(response.status).toBe(429);
      expect(response.body.message).toMatch('Error: enriath has been updated recently.');

      setUpdateCooldown(0);
    });

    it('should not track player (excessive gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Runecraft', value: 100_000_000 } // player jumps to 100m RC exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi`);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to update: Player is flagged.');

      expect(playerFlaggedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'psikoi',
          context: expect.objectContaining({
            previous: expect.objectContaining({
              data: expect.objectContaining({
                skills: expect.objectContaining({
                  runecrafting: expect.objectContaining({ experience: 5_347_176 })
                })
              })
            }),
            rejected: expect.objectContaining({
              data: expect.objectContaining({
                skills: expect.objectContaining({
                  runecrafting: expect.objectContaining({ experience: 100_000_000 })
                })
              })
            })
          })
        })
      );
    });

    it('should not track player (negative gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Runecraft', value: 100_000 } // player's RC exp goes down to 100k
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi`);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to update: Player is flagged.');

      // The player is already flagged, so this event shouldn't be triggeted
      expect(playerFlaggedEvent).not.toHaveBeenCalled();
    });

    it('should track player (new gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Zulrah', value: 1646 + 7 }, // player gains 7 zulrah kc
        { hiscoresMetricName: 'Smithing', value: 6_177_978 + 1337 } // player gains 1337 smithing exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi`);

      expect(response.status).toBe(200);
      expect(response.body.lastChangedAt).not.toBeNull();
      expect(response.body.updatedAt).toBe(response.body.latestSnapshot.createdAt);
      expect(response.body.lastChangedAt).toBe(response.body.latestSnapshot.createdAt);
      expect(new Date(response.body.lastChangedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // changed under a second ago
    });

    it('should track player (w/ account hash and auto-submit name change)', async () => {
      const response = await api
        .post(`/players/ruben`)
        .send({ accountHash: '123456' })
        .set('User-Agent', 'RuneLite');

      expect(response.status).toBe(201);

      const secondResponse = await api
        .post(`/players/alan`)
        .send({ accountHash: '123456' })
        .set('User-Agent', 'RuneLite');

      expect(secondResponse.status).toBe(500); // Player update gets interrupted if a name change is detected
      expect(secondResponse.body.message).toBe('Failed to update: Name change detected.');

      const fetchNameChangesResponse = await api.get('/names').query({ username: 'ruben' });

      expect(fetchNameChangesResponse.status).toBe(200);
      expect(fetchNameChangesResponse.body.length).toBe(1);
      expect(fetchNameChangesResponse.body[0]).toMatchObject({ oldName: 'ruben', newName: 'alan' });

      // Ensure the hash was updated to now be linked to "alan"
      const storedUsername = await redisClient.get(buildCompoundRedisKey('hash', '123456'));
      expect(storedUsername).toBe('alan');
    });

    it('should track player (w/ account hash and SKIP auto-submit name change)', async () => {
      const firstTrackResponse = await api.post(`/players/will`);
      expect(firstTrackResponse.status).toBe(201);

      const submitResponse = await api.post('/names').send({ oldName: 'will', newName: 'chuckie' });
      expect(submitResponse.status).toBe(201);

      const secondTrackResponse = await api
        .post(`/players/will`)
        .send({ accountHash: '98765' })
        .set('User-Agent', 'RuneLite');

      expect(secondTrackResponse.status).toBe(200);

      const thirdTrackResponse = await api
        .post(`/players/chuckie`)
        .send({ accountHash: '98765' })
        .set('User-Agent', 'RuneLite');

      expect(thirdTrackResponse.status).toBe(201);

      // This shouldn't submit another name changes because one already exists for that oldName->newName
      const fetchNameChangesResponse = await api.get('/names').query({ username: 'will' });
      expect(fetchNameChangesResponse.status).toBe(200);
      expect(fetchNameChangesResponse.body.length).toBe(1);

      // It should however stll update the hash to the new name
      const storedUsername = await redisClient.get(buildCompoundRedisKey('hash', '98765'));
      expect(storedUsername).toBe('chuckie');
    });

    it('should force update (despite excessive gains)', async () => {
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const firstResponse = await api.post(`/players/jonxslays`);
      expect(firstResponse.status).toBe(201);

      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Runecraft', value: 100_000_000 } // player jumps to 100m RC exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondResponse = await api.post(`/players/jonxslays`);
      expect(secondResponse.status).toBe(500);
      expect(secondResponse.body.message).toMatch('Failed to update: Player is flagged.');

      expect(playerFlaggedEvent).toHaveBeenCalled();

      const thirdResponse = await api.post(`/players/jonxslays`).send({ force: true });
      expect(thirdResponse.status).toBe(400);
      expect(thirdResponse.body.message).toBe("Required parameter 'adminPassword' is undefined.");

      const fourthResponse = await api.post(`/players/jonxslays`).send({ force: true, adminPassword: 'idk' });

      expect(fourthResponse.status).toBe(403);
      expect(fourthResponse.body.message).toBe('Incorrect admin password.');

      const fifthResponse = await api
        .post(`/players/jonxslays`)
        .send({ force: true, adminPassword: process.env.ADMIN_PASSWORD });

      expect(fifthResponse.status).toBe(200);
    });
  });

  describe('2. Searching', () => {
    it('should not search players (undefined username)', async () => {
      const response = await api.get('/players/search').query({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not search players (empty username)', async () => {
      const response = await api.get('/players/search').query({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' must have a minimum of 1 character(s).");
    });

    it('should not search players (negative pagination limit)', async () => {
      const response = await api.get(`/players/search`).query({ username: 'enr', limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not search players (negative pagination offset)', async () => {
      const response = await api.get(`/players/search`).query({ username: 'enr', offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should search players (partial username w/ offset)', async () => {
      const firstResponse = await api.get('/players/search').query({ username: 'ENR' });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.length).toBe(2);

      expect(firstResponse.body[0]).toMatchObject({
        username: 'enriath',
        type: 'regular'
      });

      expect(firstResponse.body[1]).toMatchObject({
        username: 'enrique',
        type: 'unknown'
      });

      const secondResponse = await api.get('/players/search').query({ username: 'ENR', offset: 1 });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.length).toBe(1);

      expect(secondResponse.body[0]).toMatchObject({
        username: 'enrique',
        type: 'unknown'
      });
    });

    it('should search players (leading/trailing whitespace)', async () => {
      const response = await api.get('/players/search').query({ username: '  ENR  ' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      expect(response.body[0]).toMatchObject({
        username: 'enriath',
        type: 'regular'
      });

      expect(response.body[1]).toMatchObject({
        username: 'enrique',
        type: 'unknown'
      });
    });

    it('should search players (unknown partial username)', async () => {
      const response = await api.get('/players/search').query({ username: 'zez' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe('3. Viewing', () => {
    it('should not view player details (player not found)', async () => {
      const byUsernameResponse = await api.get('/players/zezima');

      expect(byUsernameResponse.status).toBe(404);
      expect(byUsernameResponse.body.message).toMatch('Player not found.');

      const byIdResponse = await api.get('/players/id/48478474');

      expect(byIdResponse.status).toBe(404);
      expect(byIdResponse.body.message).toMatch('Player not found.');
    });

    it('should view player details', async () => {
      const byUsernameResponse = await api.get('/players/PsiKOI');

      expect(byUsernameResponse.status).toBe(200);
      expect(byUsernameResponse.body).toMatchObject({
        username: 'psikoi',
        displayName: 'PSIKOI',
        type: 'regular',
        build: 'main',
        archive: null
      });
      expect(byUsernameResponse.body.latestSnapshot).not.toBeNull();

      const byIdResponse = await api.get(`/players/id/${byUsernameResponse.body.id}`);

      expect(byIdResponse.status).toBe(200);
      expect(byIdResponse.body).toMatchObject({
        username: 'psikoi',
        displayName: 'PSIKOI',
        type: 'regular',
        build: 'main',
        archive: null
      });
      expect(byIdResponse.body.latestSnapshot).not.toBeNull();
    });
  });

  describe('4. Type Assertion', () => {
    it('should not assert player type (player not found)', async () => {
      const response = await api.post(`/players/zezima/assert-type`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      expect(playerTypeChangedEvent).not.toHaveBeenCalled();
    });

    it('should assert player type (regular)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Zulrah', value: 1646 + 7 }, // restore the zulrah kc,
        { hiscoresMetricName: 'Smithing', value: 6_177_978 + 1337 } // restore the smithing exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Unflag the player
      const trackResponse = await api.post(`/players/psikoi`);
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.status).toBe(PlayerStatus.ACTIVE);

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi/assert-type`);

      expect(response.status).toBe(200);
      expect(response.body.changed).toBe(false);
      expect(response.body.player).toMatchObject({ username: 'psikoi', type: 'regular' });

      // No type changes happened = no type change events were dispatched

      expect(playerTypeChangedEvent).not.toHaveBeenCalled();
    });

    it('should assert player type (regular -> ultimate)', async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.ULTIMATE]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 }
      });

      const assertTypeResponse = await api.post(`/players/psikoi/assert-type`);

      expect(assertTypeResponse.status).toBe(200);
      expect(assertTypeResponse.body.changed).toBe(true);
      expect(assertTypeResponse.body.player).toMatchObject({ username: 'psikoi', type: 'ultimate' });

      expect(playerTypeChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'psikoi',
          previousType: 'regular',
          newType: 'ultimate'
        })
      );

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.type).toBe('ultimate');
    });

    it('should detect player type (low level hardcore)', async () => {
      // Low level ironman accounts don't show up on the regular hiscores, so we need to handle
      // the scenario where it fails to fetch regular stats, but succeeds to fetch ironman stats
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404 },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/players/low_lvl_hcim`);
      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.type).toBe('hardcore');
    });
  });

  describe('5. Updating Country', () => {
    it('should not update player country (invalid admin password)', async () => {
      const response = await api.put(`/players/psikoi/country`).send({ country: 'PT' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not update player country (incorrect admin password)', async () => {
      const response = await api.put(`/players/psikoi/country`).send({ country: 'PT', adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not update player country (undefined country)', async () => {
      const response = await api
        .put(`/players/psikoi/country`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'country' is undefined.");
    });

    it('should not update player country (empty country)', async () => {
      const response = await api
        .put(`/players/psikoi/country`)
        .send({ country: '', adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'country' must have a minimum of 2 character(s).");
    });

    it('should not update player country (player not found)', async () => {
      const response = await api
        .put(`/players/zezima/country`)
        .send({ country: 'PT', adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should not update player country (invalid country code)', async () => {
      const response = await api
        .put(`/players/PSIKOI/country`)
        .send({ country: 'XX', adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid country.');
    });

    it('should not update player country (invalid country name)', async () => {
      const response = await api
        .put(`/players/PSIKOI/country`)
        .send({ country: 'Made up', adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid country.');
    });

    it('should update player country', async () => {
      const updateCountryResponse = await api
        .put(`/players/PSIKOI/country`)
        .send({ country: 'Portugal', adminPassword: process.env.ADMIN_PASSWORD });

      expect(updateCountryResponse.status).toBe(200);

      expect(updateCountryResponse.body).toMatchObject({
        username: 'psikoi',
        country: 'PT'
      });

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.username).toBe('psikoi');
      expect(detailsResponse.body.country).toBe('PT');
    });

    it('should update player country', async () => {
      const updateCountryResponse = await api
        .put(`/players/PSIKOI/country`)
        .send({ country: 'pt', adminPassword: process.env.ADMIN_PASSWORD });

      expect(updateCountryResponse.status).toBe(200);

      expect(updateCountryResponse.body).toMatchObject({
        username: 'psikoi',
        country: 'PT'
      });

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.username).toBe('psikoi');
      expect(detailsResponse.body.country).toBe('PT');
    });

    it('should update player country (unsetting country)', async () => {
      const updateCountryResponse = await api
        .put(`/players/psikoi/country`)
        .send({ country: null, adminPassword: process.env.ADMIN_PASSWORD });

      expect(updateCountryResponse.status).toBe(200);

      expect(updateCountryResponse.body).toMatchObject({
        username: 'psikoi',
        country: null
      });

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.username).toBe('psikoi');
      expect(detailsResponse.body.country).toBe(null);
    });
  });

  describe('6. Rolling back', () => {
    it("shouldn't rollback player (invalid admin password)", async () => {
      const response = await api.post(`/players/psikoi/rollback`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it("shouldn't rollback player (incorrect admin password)", async () => {
      const response = await api.post(`/players/psikoi/rollback`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it("shouldn't rollback player (player not found)", async () => {
      const response = await api
        .post(`/players/woah/rollback`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it("shouldn't rollback player (player has no snapshots)", async () => {
      await prisma.player.create({
        data: {
          username: 'rollmeback',
          displayName: `rollmeback`
        }
      });

      const firstResponse = await api
        .post(`/players/rollmeback/rollback`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(firstResponse.status).toBe(400);
      expect(firstResponse.body.message).toBe('No snapshots were deleted, rollback not performed.');

      const secondResponse = await api
        .post(`/players/rollmeback/rollback`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, untilLastChange: true });

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.message).toBe('No snapshots were deleted, rollback not performed.');
    });

    it('should rollback player (last snapshot)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Zulrah', value: 1646 + 7 }, // restore the zulrah kc,
        { hiscoresMetricName: 'Smithing', value: 6_177_978 + 1337 } // restore the smithing exp
      ]);

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.ULTIMATE]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 }
      });

      const playerSnapshotsBefore = await prisma.snapshot.findMany({
        where: {
          player: {
            username: 'psikoi'
          },
          createdAt: {
            gte: new Date('2010-01-01'),
            lte: new Date('2030-01-01')
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      expect(playerSnapshotsBefore.length).toBe(4);

      const rollbackResponse = await api
        .post(`/players/psikoi/rollback`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(rollbackResponse.status).toBe(200);
      expect(rollbackResponse.body.message).toMatch('Successfully rolled back player: PSIKOI');

      const playerSnapshotsAfter = await prisma.snapshot.findMany({
        where: {
          player: {
            username: 'psikoi'
          },
          createdAt: {
            gte: new Date('2010-01-01'),
            lte: new Date('2030-01-01')
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // the total number of snapshots should remain the same, because we delete the last snapshot
      // but we also create a new one by updating immediately after
      expect(playerSnapshotsAfter.length).toBe(4);

      // The last snapshot (sorted desc) should be different
      expect(playerSnapshotsAfter.at(0)!.createdAt.getTime()).not.toBe(
        playerSnapshotsBefore.at(0)!.createdAt.getTime()
      );

      // The second to last snapshot (sorted desc) should be the same
      expect(playerSnapshotsAfter.at(1)!.createdAt.getTime()).toBe(
        playerSnapshotsBefore.at(1)!.createdAt.getTime()
      );

      // The previous last snapshot shouldn't be on the new snapshots list anymore

      expect(
        playerSnapshotsAfter.find(
          s => s.createdAt.getTime() === playerSnapshotsBefore.at(0)!.createdAt.getTime()
        )
      ).not.toBeDefined();
    });

    it('should rollback player (until last changed)', async () => {
      const playerSnapshotsBefore = await prisma.snapshot.findMany({
        where: {
          player: {
            username: 'psikoi'
          },
          createdAt: {
            gte: new Date('2010-01-01'),
            lte: new Date('2030-01-01')
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      expect(playerSnapshotsBefore.length).toBe(4);

      const fakeLastChangedAt = new Date(Date.now() - 30_000); // 30 seconds ago

      // this is the number of snapshots that should be deleted
      const recentSnapshotsCount = playerSnapshotsBefore.filter(
        s => new Date(s.createdAt) > fakeLastChangedAt
      ).length;

      expect(recentSnapshotsCount).toBeGreaterThan(0);

      // Manually update this player's lastChangedAt to be 30s ago
      await prisma.player.update({
        where: { username: 'psikoi' },
        data: { lastChangedAt: fakeLastChangedAt }
      });

      // this should now delete any snapshots from the past 30s
      const rollbackResponse = await api
        .post(`/players/psikoi/rollback`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, untilLastChange: true });

      expect(rollbackResponse.status).toBe(200);
      expect(rollbackResponse.body.message).toMatch('Successfully rolled back player: PSIKOI');

      const playerSnapshotsAfter = await prisma.snapshot.findMany({
        where: {
          player: {
            username: 'psikoi'
          },
          createdAt: {
            gte: new Date('2010-01-01'),
            lte: new Date('2030-01-01')
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // it should have deleted the recent snapshots, but also added one at the end
      expect(playerSnapshotsAfter.length).toBe(4 - recentSnapshotsCount + 1);

      // The last snapshot (sorted desc) should be different
      expect(playerSnapshotsAfter.at(0)!.createdAt.getTime()).not.toBe(
        playerSnapshotsBefore.at(0)!.createdAt.getTime()
      );

      // The previous last snapshot shouldn't be on the new snapshots list anymore
      expect(
        playerSnapshotsAfter.find(
          s => s.createdAt.getTime() === playerSnapshotsBefore.at(0)!.createdAt.getTime()
        )
      ).not.toBeDefined();
    });

    it("shouldn't rollback col log (player has no snapshots)", async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Collections Logged', value: 100 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.ULTIMATE]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 }
      });

      await prisma.player.create({
        data: {
          username: 'test123',
          displayName: `test123`
        }
      });

      const response = await api
        .post(`/players/test123/rollback-col-log`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to rollback collection log data from snapshots.');
    });

    it('should rollback col log (last snapshot)', async () => {
      let modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Collections Logged', value: 100 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 },
        [PlayerType.HARDCORE]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/players/test123`);
      expect(trackResponse.statusCode).toBe(200);

      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Collections Logged', value: 1000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 },
        [PlayerType.HARDCORE]: { statusCode: 404 }
      });

      const secondTrackResponse = await api.post(`/players/test123`);
      expect(secondTrackResponse.statusCode).toBe(200);

      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Collections Logged', value: 200 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 },
        [PlayerType.HARDCORE]: { statusCode: 404 }
      });

      const rollbackResponse = await api
        .post(`/players/test123/rollback-col-log`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(rollbackResponse.status).toBe(200);
      expect(rollbackResponse.body.message).toMatch(
        'Successfully rolled back collection logs for player: test123'
      );

      const playerSnapshotsAfter = await prisma.snapshot.findMany({
        where: {
          player: {
            username: 'test123'
          }
        }
      });

      expect(playerSnapshotsAfter.length).toBe(3);
      expect(playerSnapshotsAfter.map(s => s.collections_loggedScore).filter(s => s > 200).length).toBe(0);
    });
  });

  describe('7. Deleting', () => {
    it('should not delete player (invalid admin password)', async () => {
      const response = await api.delete(`/players/psikoi`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not delete player (incorrect admin password)', async () => {
      const response = await api.delete(`/players/psikoi`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not delete player (player not found)', async () => {
      const response = await api
        .delete(`/players/zezima`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should delete player', async () => {
      const deletePlayerResponse = await api
        .delete(`/players/psikoi`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(deletePlayerResponse.status).toBe(200);
      expect(deletePlayerResponse.body.message).toMatch('Successfully deleted player: PSIKOI');

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(404);
      expect(detailsResponse.body.message).toBe('Player not found.');
    });
  });

  describe('8. Player Utils', () => {
    it('should sanitize usernames', () => {
      expect(playerUtils.sanitize('PSIKOI')).toBe('PSIKOI');
      expect(playerUtils.sanitize(' PSIKOI_')).toBe('PSIKOI');
      expect(playerUtils.sanitize('___psikoi  ')).toBe('psikoi');
    });

    it('should standardize usernames', () => {
      expect(playerUtils.standardize('HELLO WORLD')).toBe('hello world');
      expect(playerUtils.standardize(' HELLO   WORLD_')).toBe('hello   world');
      expect(playerUtils.standardize('___hello_WORLD123  ')).toBe('hello world123');
    });

    it('should check for username validity', () => {
      expect(playerUtils.isValidUsername('')).toBe(false);
      expect(playerUtils.isValidUsername('aLongUsername')).toBe(false);
      expect(playerUtils.isValidUsername('hello$#%')).toBe(false);
      expect(playerUtils.isValidUsername('HELLO WORLD')).toBe(true);
      expect(playerUtils.isValidUsername(' HELLO WORLD_')).toBe(true);
      expect(playerUtils.isValidUsername('___hello_WORLD  ')).toBe(true);
    });

    it('should find all players or create', async () => {
      const existingPlayers = await findOrCreatePlayers(['PSIKOI', 'enriath', 'enrique']);

      expect(existingPlayers.length).toBe(3);

      expect(existingPlayers[0].username).toBe('psikoi');
      expect(existingPlayers[1].username).toBe('enriath');
      expect(existingPlayers[2].username).toBe('enrique');

      const oneNewPlayer = await findOrCreatePlayers(['PSIKOI', '_enriath ', 'enrique', 'Zezima']);

      expect(oneNewPlayer.length).toBe(4);

      expect(oneNewPlayer[0].username).toBe('psikoi');
      expect(oneNewPlayer[1].username).toBe('enriath');
      expect(oneNewPlayer[2].username).toBe('enrique');
      expect(oneNewPlayer[3].username).toBe('zezima');
    });
  });

  describe('9. Archiving', () => {
    it("shouldn't auto-archive, send discord flagged report instead (excessive gains)", async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const playerResponse = await api.post(`/players/Kendall`);
      expect(playerResponse.status).toBe(201);

      const player = playerResponse.body;

      const previousSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
      );

      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Runecraft', value: 50_000_000 },
        { hiscoresMetricName: 'Agility', value: 10_000_000 },
        { hiscoresMetricName: 'Thieving', value: 20_000_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const rejectedSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(modifiedRawData))
      );

      // Manually set overall ranks and exp for de-iron checks later on
      previousSnapshot.overallRank = 10_000;
      rejectedSnapshot.overallRank = 60_000;
      rejectedSnapshot.overallExperience = 363_192_115;

      const formattedPrevious = formatSnapshotResponse(
        previousSnapshot,
        getPlayerEfficiencyMap(previousSnapshot, player)
      );

      const formattedRejected = formatSnapshotResponse(
        rejectedSnapshot,
        getPlayerEfficiencyMap(rejectedSnapshot, player)
      );

      const runecraftingEHPDiff =
        formattedRejected.data.skills.runecrafting.ehp - formattedPrevious.data.skills.runecrafting.ehp;

      const aglityEHPDiff =
        formattedRejected.data.skills.agility.ehp - formattedPrevious.data.skills.agility.ehp;

      const thievingEHPDiff =
        formattedRejected.data.skills.thieving.ehp - formattedPrevious.data.skills.thieving.ehp;

      const stackableEHPRatio =
        (aglityEHPDiff + thievingEHPDiff) / (runecraftingEHPDiff + aglityEHPDiff + thievingEHPDiff);

      expect(stackableEHPRatio).toBeCloseTo(0.37663759188558105, 7);

      const rankIncrease =
        (rejectedSnapshot.overallRank - previousSnapshot.overallRank) / previousSnapshot.overallRank;

      const expIncrease =
        (rejectedSnapshot.overallExperience - previousSnapshot.overallExperience) /
        previousSnapshot.overallExperience;

      expect(rankIncrease).toBe(5); // Increased by 500% (10k -> 60k)
      expect(expIncrease).toBeCloseTo(0.1929868502403211, 8); // Increased by 20.98% (304_439_328 -> 363_192_115)

      const flagContext = reviewFlaggedPlayer(player, previousSnapshot, rejectedSnapshot);

      expect(flagContext).toMatchObject({
        negativeGains: false,
        excessiveGains: true,
        excessiveGainsReversed: false,
        possibleRollback: false,
        data: {
          stackableGainedRatio: 0.37663758607790426
        },
        previous: {
          data: {
            skills: {
              runecrafting: { experience: 5_347_176 },
              agility: { experience: 4_442_420 },
              thieving: { experience: 6_517_527 }
            }
          }
        },
        rejected: {
          data: {
            skills: {
              runecrafting: { experience: 50_000_000 },
              agility: { experience: 10_000_000 },
              thieving: { experience: 20_000_000 }
            }
          }
        }
      });

      const trackResponse = await api.post(`/players/Kendall`);
      expect(trackResponse.status).toBe(500);
      expect(trackResponse.body.message).toBe('Failed to update: Player is flagged.');

      expect(playerFlaggedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'kendall',
          context: expect.objectContaining({
            previous: expect.objectContaining({
              data: expect.objectContaining({
                skills: expect.objectContaining({
                  runecrafting: expect.objectContaining({ experience: 5_347_176 })
                })
              })
            }),
            rejected: expect.objectContaining({
              data: expect.objectContaining({
                skills: expect.objectContaining({
                  runecrafting: expect.objectContaining({ experience: 50_000_000 })
                })
              })
            })
          })
        })
      );

      expect(playerArchivedEvent).not.toHaveBeenCalled();
    });

    it("shouldn't auto-archive, send discord flagged report instead (negative gains, possible rollback)", async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const playerResponse = await api.post(`/players/Roman`);
      expect(playerResponse.status).toBe(201);

      const player = playerResponse.body;

      const previousSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
      );

      const modifiedRejectedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Zulrah', value: 1615 }, // zulrah kc dropped from 1646 to 1615
        { hiscoresMetricName: 'Construction', value: 10_000_000 } // construction exp increased from 4_537_106 to 10m
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRejectedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const rejectedSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(modifiedRejectedRawData))
      );

      const flagContext = reviewFlaggedPlayer(player, previousSnapshot, rejectedSnapshot);

      expect(flagContext).toMatchObject({
        possibleRollback: true,
        excessiveGains: false,
        negativeGains: true,
        excessiveGainsReversed: false,
        data: {
          stackableGainedRatio: 0
        },
        previous: {
          data: {
            skills: {
              construction: { experience: 4_537_106 }
            },
            bosses: {
              zulrah: { kills: 1646 }
            }
          }
        },
        rejected: {
          data: {
            skills: {
              construction: { experience: 10_000_000 }
            },
            bosses: {
              zulrah: { kills: 1615 }
            }
          }
        }
      });

      const trackResponse = await api.post(`/players/Roman`);
      expect(trackResponse.status).toBe(500);
      expect(trackResponse.body.message).toBe('Failed to update: Player is flagged.');

      expect(playerFlaggedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'roman',
          context: expect.objectContaining({
            previous: expect.objectContaining({
              data: expect.objectContaining({
                bosses: expect.objectContaining({
                  zulrah: expect.objectContaining({ kills: 1646 })
                })
              })
            }),
            rejected: expect.objectContaining({
              data: expect.objectContaining({
                bosses: expect.objectContaining({
                  zulrah: expect.objectContaining({ kills: 1615 })
                })
              })
            })
          })
        })
      );

      expect(playerArchivedEvent).not.toHaveBeenCalled();
    });

    it("should auto-archive, and not send discord flagged report (can't be a rollback)", async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const playerResponse = await api.post(`/players/Siobhan`);
      expect(playerResponse.status).toBe(201);
      expect(playerResponse.body.archive).toBeNull();

      const player = playerResponse.body;

      const previousSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
      );

      await sleep(100);

      const modifiedRejectedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Zulrah', value: 20_000 },
        { hiscoresMetricName: 'Tombs of Amascut', value: 20_000 },
        { hiscoresMetricName: 'Runecraft', value: 200_000_000 },
        { hiscoresMetricName: 'Woodcutting', value: 200_000_000 },
        { hiscoresMetricName: 'Skotizo', value: 20 } // Skotizo kc decreased from 21 to 20
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRejectedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const rejectedSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(modifiedRejectedRawData))
      );

      const flagContext = reviewFlaggedPlayer(player, previousSnapshot, rejectedSnapshot);
      expect(flagContext).toBeNull();

      const trackResponse = await api.post(`/players/Siobhan`);
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.id).not.toBe(player.id); // ID changed, meaning this username is now on a new account
      expect(trackResponse.body.type).not.toBe('unknown');
      expect(trackResponse.body.archive).toBeNull();

      expect(playerFlaggedEvent).not.toHaveBeenCalled();

      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'siobhan'
        })
      );
    });

    it("should auto-archive, and not send discord flagged report (negative gains, excessive gains reversed, can't be a rollback)", async () => {
      const modifiedPreviousRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Mining', value: 200_000_000 } // mining exp will go from 200m to 6.5m
      ]);

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedPreviousRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const playerResponse = await api.post(`/players/Connor`);
      expect(playerResponse.status).toBe(201);

      const player = playerResponse.body;

      const previousSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(modifiedPreviousRawData))
      );

      await sleep(100);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const rejectedSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
      );

      const flagContext = reviewFlaggedPlayer(player, previousSnapshot, rejectedSnapshot);
      expect(flagContext).toBeNull();

      const trackResponse = await api.post(`/players/Connor`);
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.id).not.toBe(player.id); // ID changed, meaning this username is now on a new account
      expect(trackResponse.body.type).not.toBe('unknown');

      expect(playerFlaggedEvent).not.toHaveBeenCalled();

      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'connor'
        })
      );
    });

    it('should detect flag and auto-archive', async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const playerResponse = await api.post(`/players/Greg Hirsch`);
      expect(playerResponse.status).toBe(201);

      const player = playerResponse.body;

      // pre changes setup
      const groupId = await setupPreTransitionData(1000, player.id);

      const previousSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
      );

      await prisma.snapshot.create({ data: previousSnapshot });

      await sleep(100);
      await setupPostTransitionDate(1000, player.id, groupId);

      const modifiedRejectedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Runecraft', value: 50_000_000 },
        { hiscoresMetricName: 'Agility', value: 10_000_000 },
        { hiscoresMetricName: 'Thieving', value: 20_000_000 },
        { hiscoresMetricName: 'Mining', value: 1_000_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRejectedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const rejectedSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(modifiedRejectedRawData))
      );

      const submitNameChangeResponse = await api.post(`/names`).send({
        oldName: 'Greg Hirsch',
        newName: 'Cousin Greg'
      });

      expect(submitNameChangeResponse.status).toBe(201);

      const preArchiveNameChangesResponse = await api.get(`/names`);

      expect(preArchiveNameChangesResponse.status).toBe(200);
      expect(preArchiveNameChangesResponse.body.length).toBeGreaterThan(1);
      expect(preArchiveNameChangesResponse.body[0].status).toBe('pending');
      expect(preArchiveNameChangesResponse.body[0].oldName).toBe('Greg Hirsch');
      expect(preArchiveNameChangesResponse.body[0].newName).toBe('Cousin Greg');

      const {
        newPlayerGroupIds,
        newPlayerCompetitionIds,
        archivedPlayerCompetitionIds,
        archivedPlayerGroupIds
      } = await playerUtils.splitArchivalData(player.id, previousSnapshot.createdAt);

      expect(Array.from(archivedPlayerGroupIds)).toEqual([1001]);
      expect(Array.from(archivedPlayerCompetitionIds)).toEqual([1001, 1002, 1003, 1005, 1007, 1009]);

      expect(Array.from(newPlayerGroupIds)).toEqual([1002, 1003, 1004]);
      expect(Array.from(newPlayerCompetitionIds)).toEqual([1004, 1006, 1008]);

      const flagContext = reviewFlaggedPlayer(player, previousSnapshot, rejectedSnapshot);
      expect(flagContext).toBeNull();

      const trackResponse = await api.post(`/players/Greg Hirsch`);
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.id).not.toBe(player.id); // ID changed, meaning this username is now on a new account
      expect(trackResponse.body.type).not.toBe('unknown');

      // if the flagged event is dispatched, that means it wasn't auto-archived
      expect(playerFlaggedEvent).not.toHaveBeenCalled();

      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'greg hirsch'
        })
      );

      // hooks should be disabled during archival, so that we don't send any member joined/left events
      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();

      const archivedPlayer = (await prisma.player.findFirst({
        where: { id: player.id }
      }))!;

      const archivedDetailsResponse = await api.get(`/players/${archivedPlayer.username}`);
      expect(archivedDetailsResponse.status).toBe(200);
      expect(archivedDetailsResponse.body.archive).toMatchObject({
        playerId: player.id,
        previousUsername: 'greg hirsch'
      });

      expect(archivedPlayer.status).toBe('archived');
      expect(archivedPlayer.username).toBe(archivedPlayer.displayName);
      expect(archivedPlayer.username.startsWith('archive')).toBeTruthy();

      const trackArchivedPlayerResponse = await api.post(`/players/${archivedPlayer.username}`);
      expect(trackArchivedPlayerResponse.status).toBe(400);
      expect(trackArchivedPlayerResponse.body.message).toBe('Failed to update: Player is archived.');

      const archivals = await prisma.playerArchive.findMany({
        where: { playerId: player.id }
      });

      expect(archivals.length).toBe(1);
      expect(archivals[0].previousUsername).toBe(player.username);
      expect(archivals[0].archiveUsername).toBe(archivedPlayer.username);

      const archivedPlayerMemberships = await prisma.membership.findMany({
        where: { playerId: player.id }
      });

      expect(archivedPlayerMemberships.length).toBe(1);
      expect(archivedPlayerMemberships.map(m => m.groupId)).toEqual([1001]);

      const archivedPlayerParticipations = await prisma.participation.findMany({
        where: { playerId: player.id }
      });

      expect(archivedPlayerParticipations.length).toBe(6);
      expect(archivedPlayerParticipations.map(m => m.competitionId)).toEqual([
        1001, 1002, 1003, 1005, 1007, 1009
      ]);

      const newPlayer = (await prisma.player.findFirst({
        where: { username: player.username }
      }))!;

      expect(newPlayer.status).toBe('active');
      expect(newPlayer.username).toBe(player.username);
      expect(newPlayer.displayName).toBe(player.displayName);

      const newPlayerMemberships = await prisma.membership.findMany({
        where: { playerId: newPlayer.id }
      });

      expect(newPlayerMemberships.length).toBe(3);
      expect(newPlayerMemberships.map(m => m.groupId)).toEqual([1002, 1003, 1004]);

      const newPlayerParticipations = await prisma.participation.findMany({
        where: { playerId: newPlayer.id }
      });

      expect(newPlayerParticipations.length).toBe(3);
      expect([...newPlayerParticipations.map(m => m.competitionId)].sort()).toEqual([1004, 1006, 1008]);

      const postArchiveNameChangesResponse = await api.get(`/names`);

      expect(postArchiveNameChangesResponse.status).toBe(200);
      expect(postArchiveNameChangesResponse.body.length).toBe(preArchiveNameChangesResponse.body.length);
      expect(postArchiveNameChangesResponse.body[0].status).toBe('denied');
      expect(postArchiveNameChangesResponse.body[0].oldName).toBe('Greg Hirsch');
      expect(postArchiveNameChangesResponse.body[0].newName).toBe('Cousin Greg');
      expect(postArchiveNameChangesResponse.body[0].playerId).toBe(archivedPlayer.id);
    });

    it("shouldn't archive player (invalid admin password)", async () => {
      const response = await api.post(`/players/psikoi/archive`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it("shouldn't archive player (incorrect admin password)", async () => {
      const response = await api.post(`/players/psikoi/archive`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it("shouldn't archive player (player not found)", async () => {
      const response = await api
        .post(`/players/woah/archive`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should archive (endpoint)', async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const playerResponse = await api.post(`/players/TomWambsgans`);
      expect(playerResponse.status).toBe(201);

      const player = playerResponse.body;

      // pre changes setup
      const groupId = await setupPreTransitionData(2000, player.id);

      const previousSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
      );

      await prisma.snapshot.create({ data: previousSnapshot });

      await sleep(100);
      await setupPostTransitionDate(2000, player.id, groupId);

      const modifiedRejectedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Runecraft', value: 50_000_000 },
        { hiscoresMetricName: 'Agility', value: 10_000_000 },
        { hiscoresMetricName: 'Thieving', value: 20_000_000 },
        { hiscoresMetricName: 'Mining', value: 1_000_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRejectedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const rejectedSnapshot = buildHiscoresSnapshot(
        player.id,
        HiscoresDataSchema.parse(JSON.parse(modifiedRejectedRawData))
      );

      const submitNameChangeResponse = await api.post(`/names`).send({
        oldName: 'TomWambsgans',
        newName: 'Tom'
      });

      expect(submitNameChangeResponse.status).toBe(201);

      const preArchiveNameChangesResponse = await api.get(`/names`);

      expect(preArchiveNameChangesResponse.status).toBe(200);
      expect(preArchiveNameChangesResponse.body.length).toBeGreaterThan(1);
      expect(preArchiveNameChangesResponse.body[0].status).toBe('pending');
      expect(preArchiveNameChangesResponse.body[0].oldName).toBe('TomWambsgans');
      expect(preArchiveNameChangesResponse.body[0].newName).toBe('Tom');

      const {
        newPlayerGroupIds,
        newPlayerCompetitionIds,
        archivedPlayerCompetitionIds,
        archivedPlayerGroupIds
      } = await playerUtils.splitArchivalData(player.id, previousSnapshot.createdAt);

      expect(Array.from(archivedPlayerGroupIds)).toEqual([2001]);
      expect(Array.from(archivedPlayerCompetitionIds)).toEqual([2001, 2002, 2003, 2005, 2007, 2009]);

      expect(Array.from(newPlayerGroupIds)).toEqual([2002, 2003, 2004]);
      expect(Array.from(newPlayerCompetitionIds)).toEqual([2004, 2006, 2008]);

      const flagContext = reviewFlaggedPlayer(player, previousSnapshot, rejectedSnapshot);
      expect(flagContext).toBeNull();

      const archiveResponse = await api
        .post(`/players/TomWambsgans/archive`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(archiveResponse.status).toBe(200);
      expect(archiveResponse.body.status).toBe(PlayerStatus.ARCHIVED);
      expect(archiveResponse.body.username).toContain('archive');
      expect(archiveResponse.body.displayName).toContain('archive');

      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'tomwambsgans'
        })
      );

      // hooks should be disabled during archival, so that we don't send any member joined/left events
      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();

      const archivedPlayer = (await prisma.player.findFirst({
        where: { id: player.id }
      }))!;

      expect(archivedPlayer.status).toBe('archived');
      expect(archivedPlayer.username).toBe(archivedPlayer.displayName);
      expect(archivedPlayer.username.startsWith('archive')).toBeTruthy();

      const trackArchivedPlayerResponse = await api.post(`/players/${archivedPlayer.username}`);
      expect(trackArchivedPlayerResponse.status).toBe(400);
      expect(trackArchivedPlayerResponse.body.message).toBe('Failed to update: Player is archived.');

      const archivals = await prisma.playerArchive.findMany({
        where: { playerId: player.id }
      });

      expect(archivals.length).toBe(1);
      expect(archivals[0].previousUsername).toBe(player.username);
      expect(archivals[0].archiveUsername).toBe(archivedPlayer.username);

      const archivedPlayerMemberships = await prisma.membership.findMany({
        where: { playerId: player.id }
      });

      expect(archivedPlayerMemberships.length).toBe(1);
      expect(archivedPlayerMemberships.map(m => m.groupId)).toEqual([2001]);

      const archivedPlayerParticipations = await prisma.participation.findMany({
        where: { playerId: player.id }
      });

      expect(archivedPlayerParticipations.length).toBe(6);
      expect(archivedPlayerParticipations.map(m => m.competitionId)).toEqual([
        2001, 2002, 2003, 2005, 2007, 2009
      ]);

      const newPlayer = (await prisma.player.findFirst({
        where: { username: player.username }
      }))!;

      expect(newPlayer.status).toBe('active');
      expect(newPlayer.username).toBe(player.username);
      expect(newPlayer.displayName).toBe(player.displayName);

      const newPlayerMemberships = await prisma.membership.findMany({
        where: { playerId: newPlayer.id }
      });

      expect(newPlayerMemberships.length).toBe(3);
      expect(newPlayerMemberships.map(m => m.groupId)).toEqual([2002, 2003, 2004]);

      const newPlayerParticipations = await prisma.participation.findMany({
        where: { playerId: newPlayer.id }
      });

      expect(newPlayerParticipations.length).toBe(3);
      expect(newPlayerParticipations.map(m => m.competitionId)).toEqual([2004, 2006, 2008]);

      const postArchiveNameChangesResponse = await api.get(`/names`);

      expect(postArchiveNameChangesResponse.status).toBe(200);
      expect(postArchiveNameChangesResponse.body.length).toBe(preArchiveNameChangesResponse.body.length);
      expect(postArchiveNameChangesResponse.body[0].status).toBe('denied');
      expect(postArchiveNameChangesResponse.body[0].oldName).toBe('TomWambsgans');
      expect(postArchiveNameChangesResponse.body[0].newName).toBe('Tom');
      expect(postArchiveNameChangesResponse.body[0].playerId).toBe(archivedPlayer.id);
    });
  });

  describe('10. View archives', () => {
    it('should not fetch archives (player not found)', async () => {
      const response = await api.get(`/players/alexsuperfly/archives`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should fetch archives', async () => {
      const firstResponse = await api.get(`/players/siobhan/archives`);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.length).toBe(1);

      const archiveResponse = await api
        .post(`/players/siobhan/archive`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(archiveResponse.status).toBe(200);
      expect(archiveResponse.body.status).toBe(PlayerStatus.ARCHIVED);
      expect(archiveResponse.body.username).toContain('archive');
      expect(archiveResponse.body.displayName).toContain('archive');

      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'siobhan'
        })
      );

      const secondResponse = await api.get(`/players/siobhan/archives`);
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.length).toBe(2);

      expect(new Date(secondResponse.body[0].createdAt).getTime()).toBeGreaterThan(
        new Date(secondResponse.body[1].createdAt).getTime()
      );

      const submitNameChangeResponse = await api.post(`/names`).send({
        oldName: archiveResponse.body.username,
        newName: 'h exagon'
      });

      expect(submitNameChangeResponse.status).toBe(201);

      const approveNameChangeResponse = await api
        .post(`/names/${submitNameChangeResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(approveNameChangeResponse.status).toBe(200);

      await sleep(100);

      const thirdResponse = await api.get(`/players/siobhan/archives`);
      expect(thirdResponse.status).toBe(200);
      expect(thirdResponse.body.length).toBe(1); // Only one non-restored archive should be returned

      expect(thirdResponse.body[0].restoredAt).toBeNull();
      expect(thirdResponse.body[0].previousUsername).toBe(firstResponse.body[0].previousUsername);
    });
  });

  describe('11. Annotations', () => {
    it('should not fetch annotations (player not found)', async () => {
      const response = await api.get(`/players/gringoloko`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should return 403 when admin password is incorrect (admin validation)', async () => {
      const response = await api.post(`/players/psikoi/annotation`).send({
        adminPassword: 'abc',
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should return 400 when admin password is missing (admin validation)', async () => {
      const response = await api.post(`/players/psikoi/annotation`).send({
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should return 400 when annotation is invalid', async () => {
      const response = await api.post(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: 'invalid'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'annotationType'.");
    });

    it('shoould return 400 when annotation is missing', async () => {
      const response = await api.post(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'annotationType' is undefined.");
    });

    it('should create a valid annotation', async () => {
      await findOrCreatePlayers(['psikoi']);
      const response = await api.post(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe(PlayerAnnotationType.OPT_OUT);
    });

    it('should fetch "psikoi"', async () => {
      await findOrCreatePlayers(['psikoi']);
      await api.post(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: PlayerAnnotationType.OPT_OUT
      });
      const response = await api.get(`/players/psikoi`);

      expect(response.status).toBe(200);
      expect(response.body.annotations[0].type).toBe(PlayerAnnotationType.OPT_OUT);
    });

    it('should delete annotation', async () => {
      await findOrCreatePlayers(['psikoi']);
      await api.post(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      const response = await api.delete(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      expect(response.status).toBe(200);
      expect(response.body).toBe(`Annotation ${PlayerAnnotationType.OPT_OUT} deleted for player psikoi`);
    });

    it('should fail to delete unexisting annotation', async () => {
      await findOrCreatePlayers(['psikoi']);
      const response = await api.delete(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(`${PlayerAnnotationType.OPT_OUT} does not exist for psikoi.`);
    });

    it('should throw conflit error 409 to create', async () => {
      await findOrCreatePlayers(['psikoi']);
      await api.post(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      const response = await api.post(`/players/psikoi/annotation`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        annotationType: PlayerAnnotationType.OPT_OUT
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('The annotation opt_out already exists for psikoi');
    });
  });

  async function setupPostTransitionDate(idOffset: number, playerId: number, groupId: number) {
    await prisma.group.create({
      data: {
        id: idOffset + 2,
        name: `Test Group 2 ${idOffset}`,
        verificationHash: '',
        memberships: { create: { playerId } }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 4,
        title: `Test Competition 4`,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3_600_000),
        verificationHash: '',
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 5,
        title: `Test Competition 5`,
        groupId,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3_600_000),
        verificationHash: '',
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 6,
        title: `Test Competition 6`,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3_600_000),
        verificationHash: '',
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.group.create({
      data: {
        id: idOffset + 3,
        name: `Test Group 3 ${idOffset}`,
        verificationHash: '',
        memberships: {
          create: {
            playerId
          }
        }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 7,
        title: `Test Competition 7`,
        groupId,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3_600_000),
        verificationHash: '',
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 8,
        title: `Test Competition 8`,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3_600_000),
        verificationHash: '',
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 9,
        title: `Test Competition 9`,
        groupId,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3_600_000),
        verificationHash: '',
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.group.create({
      data: {
        id: idOffset + 4,
        name: `Test Group 4 ${idOffset}`,
        verificationHash: '',
        memberships: {
          create: {
            playerId
          }
        }
      }
    });
  }

  async function setupPreTransitionData(idOffset: number, playerId: number) {
    const group1 = await prisma.group.create({
      data: {
        id: idOffset + 1,
        name: `Test Group 1 ${idOffset}`,
        verificationHash: '',
        memberships: { create: { playerId } }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 1,
        title: `Test Competition 1`,
        startsAt: new Date('2020-01-01'),
        endsAt: new Date('2020-03-01'),
        verificationHash: '',
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 2,
        title: `Test Competition 2`,
        startsAt: new Date('2020-01-01'),
        endsAt: new Date('2020-03-01'),
        verificationHash: '',
        groupId: group1.id,
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    await prisma.competition.create({
      data: {
        id: idOffset + 3,
        title: `Test Competition 3`,
        startsAt: new Date('2020-01-01'),
        endsAt: new Date('2030-03-01'),
        verificationHash: '',
        groupId: group1.id,
        participations: {
          create: {
            playerId
          }
        },
        metrics: {
          create: {
            metric: 'zulrah'
          }
        }
      }
    });

    return group1.id;
  }
});
