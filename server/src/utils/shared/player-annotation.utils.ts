import { PrismaTypes } from '../../prisma';
import { PlayerAnnotationType } from '../../types';

export function optOutFilter(
  types: PlayerAnnotationType | PlayerAnnotationType[]
): PrismaTypes.PlayerWhereInput {
  return {
    annotations: {
      none: {
        type: Array.isArray(types) ? { in: types } : types
      }
    }
  };
}
