import { Player } from '../../../prisma';

export type PlayerResolvable = Partial<Pick<Player, 'id' | 'username'>>;
