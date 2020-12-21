import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { Competition, Player, Snapshot } from '../../database/models';

// Define other table options
const options = {
  modelName: 'participations',
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'competitionId']
    }
  ]
};

@Table(options)
export default class Participation extends Model<Participation> {
  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, primaryKey: true, onDelete: 'CASCADE' })
  playerId: number;

  @ForeignKey(() => Competition)
  @Column({ type: DataType.INTEGER, primaryKey: true, onDelete: 'CASCADE' })
  competitionId: number;

  @Column({ type: DataType.STRING(30) })
  teamName: string;

  @ForeignKey(() => Snapshot)
  @Column({ type: DataType.INTEGER })
  startSnapshotId: number;

  @ForeignKey(() => Snapshot)
  @Column({ type: DataType.INTEGER })
  endSnapshotId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;

  @BelongsTo(() => Competition)
  competition: Competition;

  @BelongsTo(() => Snapshot, 'startSnapshotId')
  startSnapshot: Snapshot;

  @BelongsTo(() => Snapshot, 'endSnapshotId')
  endSnapshot: Snapshot;
}
