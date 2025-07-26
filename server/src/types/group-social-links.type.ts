export interface GroupSocialLinks {
  id: number;
  groupId: number;
  website: string | null;
  discord: string | null;
  twitter: string | null;
  youtube: string | null;
  twitch: string | null;
  createdAt: Date;
  updatedAt: Date;
}
