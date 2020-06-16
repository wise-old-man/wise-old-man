import { SKILLS, BOSSES, ACTIVITIES, getRankKey, getValueKey } from '../../api/constants/metrics';

import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull
} from 'sequelize-typescript';
import { Player } from '.';
import HiscoreValues from './hiscoreValues.model';

// Define other table options
const options = {
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['playerId']
    },
    {
      fields: ['createdAt']
    }
  ]
};

@Table(options)
export default class Snapshot extends HiscoreValues {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => Player)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  playerId: number;

  @Column({ type: DataType.DATE })
  importedAt: Date;

  @BelongsTo(() => Player)
  player: Player;
}

function buildDynamicSchema(DataTypes) {
  const obj = {};

  SKILLS.forEach(s => {
    obj[getRankKey(s)] = {
      type: DataTypes.INTEGER,
      defaultValue: -1,
      allowNull: false
    };
    obj[getValueKey(s)] = {
      type: s === 'overall' ? DataTypes.BIGINT : DataTypes.INTEGER,
      defaultValue: -1,
      allowNull: false,
      get() {
        // As experience (overall) can exceed the integer maximum of 2.147b,
        // we have to store it into a BIGINT, however, sequelize returns bigints
        // as strings, to counter that, we convert every bigint to a JS number
        return parseInt(this.getDataValue(getValueKey(s)), 10);
      }
    };
  });

  ACTIVITIES.forEach(s => {
    obj[getRankKey(s)] = {
      type: DataTypes.INTEGER,
      defaultValue: -1,
      allowNull: false
    };
    obj[getValueKey(s)] = {
      type: DataTypes.INTEGER,
      defaultValue: -1,
      allowNull: false
    };
  });

  BOSSES.forEach(s => {
    obj[getRankKey(s)] = {
      type: DataTypes.INTEGER,
      defaultValue: -1,
      allowNull: false
    };
    obj[getValueKey(s)] = {
      type: DataTypes.INTEGER,
      defaultValue: -1,
      allowNull: false
    };
  });

  return obj;
}

// export default (sequelize, DataTypes) => {
//   // Define the snapshot schema
//   const snapshotSchema = {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     playerId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     importedAt: {
//       type: DataTypes.DATE
//     },
//     ...buildDynamicSchema(DataTypes)
//   };

//   // Define other table options
//   const options = {
//     updatedAt: false,
//     indexes: [
//       {
//         unique: true,
//         fields: ['id']
//       },
//       {
//         fields: ['playerId']
//       },
//       {
//         fields: ['createdAt']
//       }
//     ]
//   };

//   // Create the model
//   const Snapshot = sequelize.define('snapshots', snapshotSchema, options);

//   // Define all model associations
//   Snapshot.associate = models => {
//     Snapshot.belongsTo(models.Player, {
//       foreignKey: 'playerId',
//       onDelete: 'CASCADE'
//     });
//   };

//   return Snapshot;
// };
