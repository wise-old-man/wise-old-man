import { Player } from '../../../prisma';

export type PlayerResolvable = Partial<Pick<Player, 'id' | 'username'>>;

export interface PlayerDetails extends Player {
  combatLevel: number;
  latestSnapshot: any;
}
