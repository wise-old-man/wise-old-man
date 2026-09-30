export interface Patron {
  id: string;
  name: string | null;
  email: string | null;
  discordId: string | null;
  groupId: number | null;
  playerId: number | null;
  tier: number;
  createdAt: Date;
}
