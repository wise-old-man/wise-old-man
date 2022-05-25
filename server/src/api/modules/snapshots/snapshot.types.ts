import { PrismaTypes } from '../../../prisma';

export type SnapshotFragment = PrismaTypes.XOR<
  PrismaTypes.SnapshotCreateInput,
  PrismaTypes.SnapshotUncheckedCreateInput
> & { playerId: number };

export enum SnapshotDataSource {
  HISCORES,
  CRYSTAL_MATH_LABS
}
