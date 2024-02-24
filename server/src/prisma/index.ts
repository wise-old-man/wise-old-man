import {
  PrismaClient,
  PrismaPromise,
  Delta as PrismaDelta,
  Player as PrismaPlayer,
  Record as PrismaRecord,
  Snapshot as PrismaSnapshot,
  Achievement as PrismaAchievement,
  TrendDatapoint as PrismaTrendDatapoint,
  Patron,
  Competition,
  Participation,
  NameChange as PrismaNameChange,
  Group,
  PlayerArchive,
  Membership,
  Prisma,
  Country,
  MemberActivity,
  GroupSocialLinks as PrismaGroupSocialLinks
} from '@prisma/client';
import { DenyContext, SkipContext, isComputedMetric } from '../utils';
import { NameChangeStatus } from './enum-adapter';
import { routeAfterHook } from './hooks';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return parseBigInt(this);
};

function parseBigInt(bigint: bigint): number {
  return bigint !== null && bigint !== undefined && parseInt(bigint.toString());
}

const prisma = new PrismaClient();

const extendedClient = prisma.$extends({
  result: {
    record: {
      value: {
        needs: { metric: true, value: true },
        compute({ value, metric }) {
          return isComputedMetric(metric) ? parseBigInt(value) / 10_000 : parseBigInt(value);
        }
      }
    },
    achievement: {
      threshold: {
        needs: { threshold: true },
        compute({ threshold }) {
          return parseBigInt(threshold);
        }
      },
      accuracy: {
        needs: { accuracy: true },
        compute({ accuracy }) {
          return accuracy == null ? null : parseBigInt(accuracy);
        }
      }
    },
    snapshot: {
      overallExperience: {
        needs: { overallExperience: true },
        compute({ overallExperience }) {
          return parseBigInt(overallExperience);
        }
      }
    },
    delta: {
      overall: {
        needs: { overall: true },
        compute({ overall }) {
          return parseBigInt(overall);
        }
      }
    },
    player: {
      exp: {
        needs: { exp: true },
        compute({ exp }) {
          return parseBigInt(exp);
        }
      },
      latestSnapshotId: {
        needs: {},
        compute() {
          return undefined;
        }
      }
    },
    trendDatapoint: {
      sum: {
        needs: { sum: true },
        compute({ sum }) {
          return parseBigInt(sum);
        }
      },
      maxValue: {
        needs: { maxValue: true },
        compute({ maxValue }) {
          return parseBigInt(maxValue);
        }
      }
    },
    groupSocialLinks: {
      id: {
        compute() {
          return undefined;
        }
      },
      groupId: {
        compute() {
          return undefined;
        }
      },
      createdAt: {
        compute() {
          return undefined;
        }
      },
      updatedAt: {
        compute() {
          return undefined;
        }
      }
    }
  }
});

// Register Hooks
prisma.$use(async (params, next) => {
  const result = await next(params);

  routeAfterHook(params, result);

  return result;
});

type Achievement = Omit<PrismaAchievement, 'threshold' | 'accuracy'> & {
  threshold: number;
  accuracy: number | null;
};

type Record = Omit<PrismaRecord, 'value'> & {
  value: number;
};

type Delta = Omit<PrismaDelta, 'overall'> & {
  overall: number;
};

type Snapshot = Omit<PrismaSnapshot, 'overallExperience'> & {
  overallExperience: number;
};

type TrendDatapoint = Omit<PrismaTrendDatapoint, 'sum' | 'maxValue'> & {
  sum: number;
  maxValue: number;
};

type Player = Omit<PrismaPlayer, 'exp' | 'latestSnapshotId'> & {
  exp: number;
};

type NameChange = Omit<PrismaNameChange, 'reviewContext'> & {
  reviewContext: SkipContext | DenyContext | null;
};

type GroupSocialLinks = Omit<PrismaGroupSocialLinks, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>;

export {
  Prisma as PrismaTypes,
  PrismaPromise,
  // Models
  NameChange,
  Patron,
  Group,
  Membership,
  Competition,
  Participation,
  PlayerArchive,
  Player,
  Delta,
  Record,
  Snapshot,
  Achievement,
  MemberActivity,
  GroupSocialLinks,
  TrendDatapoint,
  // Enums
  Country,
  NameChangeStatus
};

export default extendedClient;
