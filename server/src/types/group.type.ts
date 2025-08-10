export interface Group {
  id: number;
  name: string;
  clanChat: string | null;
  description: string | null;
  homeworld: number | null;
  verified: boolean;
  patron: boolean;
  visible: boolean;
  profileImage: string | null;
  bannerImage: string | null;
  score: number;
  verificationHash: string;
  createdAt: Date;
  updatedAt: Date;
  creatorIpHash: string | null;
}
