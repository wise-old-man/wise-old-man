import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Player } from '.';
import { ALL_METRICS, PERIODS } from '../../api/constants';

// Define other table options
const options = {
  modelName: 'records',
  createdAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      unique: true,
      fields: ['playerId', 'period', 'metric']
    },
    {
      fields: ['playerId']
    },
    {
      fields: ['period']
    },
    {
      fields: ['metric']
    }
  ]
};

@Table(options)
export default class Record extends Model<Record> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => Player)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  playerId: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...PERIODS),
    validate: {
      args: [PERIODS],
      msg: 'Invalid period'
    }
  })
  period: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...ALL_METRICS),
    validate: {
      isIn: {
        args: [ALL_METRICS],
        msg: 'Invalid metric'
      }
    }
  })
  metric: string;

  @Default(0)
  @Column({
    type: DataType.BIGINT,
    get(this: any) {
      // As experience (overall) can exceed the integer maximum of 2.147b,
      // we have to store it into a BIGINT, however, sequelize returns bigints
      // as strings, to counter that, we convert every bigint to a JS number
      return parseInt(this.getDataValue('value'), 10);
    }
  })
  value: number;

  @BelongsTo(() => Player)
  player: Player;
}
