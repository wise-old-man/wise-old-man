import { Player } from '../../../prisma';
import { FormattedSnapshot } from '../snapshots/snapshot.types';

export type PlayerResolvable = Partial<Pick<Player, 'id' | 'username'>>;

export interface PlayerDetails extends Player {
  combatLevel: number;
  latestSnapshot: FormattedSnapshot;
}
