import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  Model,
  ForeignKey,
  BelongsTo,
  AllowNull
} from 'sequelize-typescript';
import { Player } from '.';

// Define other table options
const options = {
  modelName: 'achievements',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'type']
    },
    {
      fields: ['playerId']
    },
    {
      fields: ['type']
    }
  ]
};

@Table(options)
export default class Achievement extends Model<Achievement> {
  @PrimaryKey
  @ForeignKey(() => Player)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  playerId: number;

  @PrimaryKey
  @AllowNull(false)
  @Column({ type: DataType.STRING })
  type: string;

  @Column({ type: DataType.STRING })
  metric: string;

  @Column({
    type: DataType.BIGINT,
    get(this: any) {
      return parseInt(this.getDataValue('threshold', 10));
    }
  })
  threshold: number;

  @BelongsTo(() => Player)
  player: Player;
}
