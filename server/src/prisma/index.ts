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

const extendedClient = prisma
  .$extends({
    model: {
      player: {
        // This is shit code
        // We shouldn't be omitting "latestSnapshotId" from the player result.
        // Instead, we should be using renderers/formatters to prevent leaking "omitted" fields into public responses
        // But for now, this is a way to get latestSnapshotId into the player result
        findPreExtension: async (args: Parameters<typeof prisma.player.findFirst>[0]) => {
          return prisma.player.findFirst(args);
        }
      }
    }
  })
  .$extends({
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
      group: {
        creatorIpHash: {
          compute() {
            return undefined;
          }
        }
      },
      competition: {
        creatorIpHash: {
          compute() {
            return undefined;
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

export { PrismaPromise, Prisma as PrismaTypes };

export default extendedClient;
