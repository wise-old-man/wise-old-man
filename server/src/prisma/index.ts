import { Prisma, PrismaClient, PrismaPromise } from '@prisma/client';
import { isComputedMetric } from '../utils/shared';

// @ts-expect-error - This is a polyfill for BigInt support in JSON
BigInt.prototype.toJSON = function () {
  return parseBigInt(this as unknown as bigint);
};

function parseBigInt(bigint: bigint): number {
  return parseInt(bigint.toString());
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
      }
    }
  }
});

export { PrismaPromise, Prisma as PrismaTypes };

export default extendedClient;
