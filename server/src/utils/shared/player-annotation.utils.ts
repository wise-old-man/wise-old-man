import { PlayerAnnotationType } from '@prisma/client';

export function optOutFilter(types: PlayerAnnotationType | PlayerAnnotationType[]) {
  return {
    annotations: {
      none: {
        type: Array.isArray(types) ? { in: types } : types
      }
    }
  };
}
