import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Group, Participation, Player } from '.';
import { ALL_METRICS } from '../../api/constants';

// Define other table options
const options = {
  modelName: 'competitions',
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
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
    validate: {
      len: {
        args: [1, 50],
        msg: 'Competition title must be between 1 and 50 characters long.'
      }
    }
  })
  title: string;

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
  @Column({ type: DataType.INTEGER })
  score: number;

  @AllowNull(false)
  @Column({ type: DataType.VIRTUAL })
  verificationCode: any;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  verificationHash: string;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    validate: {
      isDate: {
        args: true,
        msg: 'Start date must be a valid date'
      }
    }
  })
  startsAt: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      isDate: {
        args: true,
        msg: 'End date must be a valid date'
      }
    }
  })
  endsAt: Date;

  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, onDelete: 'SET NULL' })
  groupId: number;

  @BelongsTo(() => Group)
  group: Group;

  @BelongsToMany(() => Player, {
    as: 'participants',
    through: () => Participation
  })
  participants: Player[];
}
