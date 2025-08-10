import { CompetitionType } from './competition-type.enum';
import { Metric } from './metric.enum';

export interface Competition {
  id: number;
  title: string;
  metric: Metric;
  type: CompetitionType;
  startsAt: Date;
  endsAt: Date;
  groupId: number | null;
  score: number;
  visible: boolean;
  verificationHash: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  creatorIpHash: string | null;
}
