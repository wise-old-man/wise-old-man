import { NameChangeReviewContext } from './name-change-review-context.type';
import { NameChangeStatus } from './name-change-status.enum';

export interface NameChange {
  id: number;
  playerId: number;
  oldName: string;
  newName: string;
  status: NameChangeStatus;
  reviewContext: NameChangeReviewContext | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
