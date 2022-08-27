import { Record, Player } from '../../../prisma';

export type RecordLeaderboardEntry = Record & { player: Player };
export { Record } from '../../../prisma';
