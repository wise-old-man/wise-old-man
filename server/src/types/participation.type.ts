export interface Participation {
  playerId: number;
  competitionId: number;
  startSnapshotId: number | null;
  endSnapshotId: number | null;
  teamName: string | null;
  createdAt: Date;
  updatedAt: Date;
}
