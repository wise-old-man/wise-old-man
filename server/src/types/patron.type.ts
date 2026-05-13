export interface Patron {
  id: string;
  name: string;
  email: string | null;
  discordId: string | null;
  groupId: number | null;
  playerId: number | null;
  tier: number;
  createdAt: Date;
}
