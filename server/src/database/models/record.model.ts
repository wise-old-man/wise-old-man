import { periods } from '../../api/constants/periods';
import { ALL_METRICS } from '../../api/constants/metrics';

import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Model,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default
} from 'sequelize-typescript';
import { Player } from '.';

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

  @BelongsTo(() => Player)
  player: Player;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...periods),
    validate: {
      args: [periods],
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
    get() {
      // As experience (overall) can exceed the integer maximum of 2.147b,
      // we have to store it into a BIGINT, however, sequelize returns bigints
      // as strings, to counter that, we convert every bigint to a JS number
      return parseInt(this.getDataValue('value'), 10);
    }
  })
  value: number;
}

// export default (sequelize, DataTypes) => {
//   // Define the record schema
//   const recordSchema = {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     playerId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     period: {
//       type: DataTypes.ENUM(periods),
//       allowNull: false,
//       validate: {
//         isIn: {
//           args: [periods],
//           msg: 'Invalid period'
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
//     value: {
//       type: DataTypes.BIGINT,
//       defaultValue: 0,
//       get() {
//         // As experience (overall) can exceed the integer maximum of 2.147b,
//         // we have to store it into a BIGINT, however, sequelize returns bigints
//         // as strings, to counter that, we convert every bigint to a JS number
//         return parseInt(this.getDataValue('value'), 10);
//       }
//     }
//   };

//   // Define other table options
//   const options = {
//     createdAt: false,
//     indexes: [
//       {
//         unique: true,
//         fields: ['id']
//       },
//       {
//         unique: true,
//         fields: ['playerId', 'period', 'metric']
//       },
//       {
//         fields: ['playerId']
//       },
//       {
//         fields: ['period']
//       },
//       {
//         fields: ['metric']
//       }
//     ]
//   };

//   // Create the model
//   const Record = sequelize.define('records', recordSchema, options);

//   // Define all model associations
//   Record.associate = models => {
//     Record.belongsTo(models.Player, {
//       foreignKey: 'playerId',
//       onDelete: 'CASCADE'
//     });
//   };

//   return Record;
// };
