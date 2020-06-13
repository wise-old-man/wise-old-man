import { ALL_METRICS } from '../../api/constants/metrics';
import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Model,
  ForeignKey,
  BelongsToMany
} from 'sequelize-typescript';
import Group from './group.model';
import Player from './player.model';

// Define other table options
const options = {
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
  // Competition.associate = models => {
  //   Competition.belongsToMany(models.Player, {
  //     as: 'participants',
  //     through: 'participations',
  //     foreignKey: 'competitionId'
  //   });

  @PrimaryKey
  @AutoIncrement
  // @BelongsToMany(() => Player, 'participations', 'competitionId')
  @Column
  id: Number;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    validate: {
      len: {
        args: [1, 30],
        msg: 'Competition title must be between 1 and 30 characters long.'
      }
    }
  })
  title: String;

  @Column({
    type: DataType.ENUM(...ALL_METRICS),
    allowNull: false,
    validate: {
      isIn: {
        args: [ALL_METRICS],
        msg: 'Invalid metric'
      }
    }
  })
  metric: String;

  @Column({ defaultValue: 0 })
  score: Number;

  @Column({
    type: DataType.VIRTUAL,
    allowNull: false
  })
  verificationCode: any;

  @Column({ allowNull: false })
  verificationHash: String;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      isDate: {
        args: true,
        msg: 'Start date must be a valid date'
      }
    }
  })
  startsAt: Date;

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
  @Column({ onDelete: 'SET NULL' })
  groupId: Number;
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
