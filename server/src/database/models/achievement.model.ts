import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Player } from '../../database/models';

// Define other table options
const options = {
  modelName: 'achievements',
  updatedAt: false, // A "updatedAt" column is not necessary
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'name']
    },
    {
      fields: ['playerId']
    }
  ]
};

@Table(options)
export default class Achievement extends Model<Achievement> {
  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, primaryKey: true, allowNull: false, onDelete: 'CASCADE' })
  playerId: number;

  @Column({ type: DataType.STRING, primaryKey: true, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING })
  metric: string;

  @Column({ type: DataType.BIGINT, get: parseThreshold })
  threshold: number;

  @CreatedAt
  createdAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;
}

function parseThreshold(this: any) {
  return parseInt(this.getDataValue('threshold', 10));
}
