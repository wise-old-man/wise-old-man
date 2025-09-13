import { Country } from './country.enum';
import { PlayerBuild } from './player-build.enum';
import { PlayerStatus } from './player-status.enum';
import { PlayerType } from './player-type.enum';

export interface Player {
  id: number;
  username: string;
  displayName: string;
  type: PlayerType;
  build: PlayerBuild;
  status: PlayerStatus;
  country: Country | null;
  patron: boolean;
  exp: number;
  ehp: number;
  ehb: number;
  ttm: number;
  tt200m: number;
  registeredAt: Date;
  updatedAt: Date | null;
  lastChangedAt: Date | null;
  lastImportedAt: Date | null;
  latestSnapshotId: number | null;
  latestSnapshotDate: Date | null;
}
