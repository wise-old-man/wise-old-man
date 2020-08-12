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
import { Competition, Player } from '../../database/models';

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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;

  @BelongsTo(() => Competition)
  competition: Competition;
}
