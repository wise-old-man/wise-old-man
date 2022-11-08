import { Player } from '../../../prisma';
import { FormattedSnapshot } from '../snapshots/snapshot.types';

export interface PlayerDetails extends Player {
  combatLevel: number;
  latestSnapshot: FormattedSnapshot;
}

export { Player };
