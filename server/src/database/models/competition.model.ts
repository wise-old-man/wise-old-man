import { ALL_METRICS } from '../../api/constants/metrics';
import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Model,
  ForeignKey,
  BelongsToMany,
  BelongsTo,
  AllowNull,
  Default,
  HasMany
} from 'sequelize-typescript';
import { Group, Player, Participation } from '.';

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
    type: DataType.STRING(30),
    validate: {
      len: {
        args: [1, 30],
        msg: 'Competition title must be between 1 and 30 characters long.'
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

// export default (sequelize, DataTypes) => {
//   // Define the competition schema
//   const competitionSchema = {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     title: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//       validate: {
//         len: {
//           args: [1, 30],
//           msg: 'Competition title must be between 1 and 30 characters long.'
//         }
//       }
//     },
//     metric: {
//       type: DataTypes.ENUM(ALL_METRICS),
//       allowNull: false,
//       validate: {
//         isIn: {
//           args: [ALL_METRICS],
//           msg: 'Invalid metric'
//         }
//       }
//     },
//     verificationCode: {
//       type: DataTypes.VIRTUAL,
//       allowNull: false
//     },
//     verificationHash: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     startsAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       validate: {
//         isDate: {
//           args: [true],
//           msg: 'Start date must be a valid date'
//         }
//       }
//     },
//     endsAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       validate: {
//         isDate: {
//           args: [true],
//           msg: 'End date must be a valid date'
//         }
//       }
//     },
//     groupId: {
//       type: DataTypes.INTEGER
//     }
//   };

//   // Define other table options
//   const options = {
//     indexes: [
//       {
//         unique: true,
//         fields: ['id']
//       },
//       {
//         fields: ['title']
//       },
//       {
//         fields: ['metric']
//       },
//       {
//         fields: ['startsAt']
//       },
//       {
//         fields: ['endsAt']
//       }
//     ]
//   };

//   // Create the model
//   const Competition = sequelize.define('competitions', competitionSchema, options);

//   Competition.associate = models => {
//     Competition.belongsToMany(models.Player, {
//       as: 'participants',
//       through: 'participations',
//       foreignKey: 'competitionId'
//     });

//     Competition.belongsTo(models.Group, {
//       foreignKey: 'groupId',
//       onDelete: 'SET NULL'
//     });
//   };

//   return Competition;
// };
