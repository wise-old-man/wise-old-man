import { PlayerAnnotationType } from './player-annotation-type.enum';

export interface PlayerAnnotation {
  playerId: number;
  type: PlayerAnnotationType;
  createdAt: Date;
}
