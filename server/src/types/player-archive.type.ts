export interface PlayerArchive {
  playerId: number;
  previousUsername: string;
  archiveUsername: string;
  restoredUsername: string | null;
  createdAt: Date;
  restoredAt: Date | null;
}
