import { BelongsTo, Column, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { Player } from 'database/models';
import { ALL_METRICS, PERIODS } from 'api/constants';

// Define other table options
const options = {
  modelName: 'records',
  createdAt: false,
  validate: {
    validateMetric,
    validatePeriod
  },
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
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  playerId: number;

  @Column({ type: DataType.ENUM(...PERIODS), allowNull: false })
  period: string;

  @Column({ type: DataType.ENUM(...ALL_METRICS), allowNull: false })
  metric: string;

  @Column({ type: DataType.BIGINT, get: parseValue, defaultValue: 0 })
  value: number;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;
}

/**
 * As experience (overall) can exceed the integer maximum of 2.147b,
 * we have to store it into a BIGINT, however, sequelize returns bigints
 * as strings, to counter that, we convert every bigint to a JS number
 */
function parseValue(this: any) {
  return parseInt(this.getDataValue('value', 10));
}

function validateMetric(this: Record) {
  if (!ALL_METRICS.includes(this.metric)) {
    throw new Error('Invalid metric.');
  }
}

function validatePeriod(this: Record) {
  if (!PERIODS.includes(this.period)) {
    throw new Error('Invalid period.');
  }
}
