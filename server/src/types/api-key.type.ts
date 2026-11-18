export interface ApiKey {
  id: string;
  master: boolean;
  active: boolean;
  developer: string;
  developerDiscordId: string | null;
  application: string;
  createdAt: Date | null;
}
