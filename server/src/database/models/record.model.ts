import { periods } from '../../api/constants/periods';
import { ALL_METRICS } from '../../api/constants/metrics';

import { Table, Column, DataType, PrimaryKey, AutoIncrement, Model, ForeignKey } from 'sequelize-typescript';
import Player from './player.model';

// Define other table options
const options = {
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
  @Column
  id: Number;

  @ForeignKey(() => Player)
  @Column({ allowNull: false, onDelete: 'CASCADE' })
  playerId: Number;

  @Column({
    type: DataType.ENUM(...periods),
    allowNull: false,
    validate: {
      args: [periods],
      msg: 'Invalid period'
    }
  })
  period: String;

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

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    get() {
      // As experience (overall) can exceed the integer maximum of 2.147b,
      // we have to store it into a BIGINT, however, sequelize returns bigints
      // as strings, to counter that, we convert every bigint to a JS number
      return parseInt(this.getDataValue('value'), 10);
    }
  })
  value: Number;
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
