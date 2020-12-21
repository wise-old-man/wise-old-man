import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { ALL_METRICS, COMPETITION_TYPES } from '../../api/constants';
import { isValidDate } from '../../api/util/dates';
import { Group, Participation, Player } from '../../database/models';

// Define other table options
const options = {
  modelName: 'competitions',
  defaultScope: {
    attributes: { exclude: ['verificationHash'] }
  },
  scopes: {
    withHash: {
      attributes: { include: ['verificationHash'] }
    }
  },
  validate: {
    validateTitle,
    validateMetric,
    validateDates
  },
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['title']
    },
    {
      fields: ['metric']
    },
    {
      fields: ['startsAt']
    },
    {
      fields: ['endsAt']
    }
  ]
};

@Table(options)
export default class Competition extends Model<Competition> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(50), allowNull: false })
  title: string;

  @Column({ type: DataType.ENUM(...ALL_METRICS), allowNull: false })
  metric: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  score: number;

  @Column({ type: DataType.VIRTUAL, allowNull: false })
  verificationCode: any;

  @Column({ type: DataType.STRING, allowNull: false })
  verificationHash: string;

  @Column({ type: DataType.DATE, allowNull: false })
  startsAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  endsAt: Date;

  @Column({ type: DataType.STRING(20), defaultValue: COMPETITION_TYPES[0] })
  type: string;

  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, onDelete: 'SET NULL' })
  groupId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsTo(() => Group)
  group: Group;

  @BelongsToMany(() => Player, { as: 'participants', through: () => Participation })
  participants: Player[];
}

function validateTitle(this: Competition): void {
  if (this.title.length < 1) {
    throw new Error('Competition title must have atleast one character.');
  }

  if (this.title.length > 50) {
    throw new Error('Competition title must be shorted than 50 characters.');
  }
}

function validateMetric(this: Competition): void {
  if (!ALL_METRICS.includes(this.metric)) {
    throw new Error('Invalid metric.');
  }
}

function validateDates(this: Competition): void {
  if (!isValidDate(this.startsAt)) {
    throw new Error('Start date must be a valid date.');
  }

  if (!isValidDate(this.endsAt)) {
    throw new Error('End date must be a valid date.');
  }
}
