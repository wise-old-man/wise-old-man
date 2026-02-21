import { Prisma, PlayerAnnotationType } from '@prisma/client';

export function optOutFilter(types: PlayerAnnotationType | PlayerAnnotationType[]): Prisma.PlayerWhereInput {
  return {
    annotations: {
      none: {
        type: Array.isArray(types) ? { in: types } : types
      }
    }
  };
}
