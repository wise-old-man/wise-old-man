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

  @BelongsTo(() => Player)
  player: Player;

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
}

// export default (sequelize, DataTypes) => {
//   // Define the achievement schema
//   const achievementSchema = {
//     playerId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       allowNull: false
//     },
//     type: {
//       type: DataTypes.STRING,
//       primaryKey: true,
//       allowNull: false
//     },
//     metric: {
//       type: DataTypes.STRING
//     },
//     threshold: {
//       type: DataTypes.BIGINT,
//       get() {
//         // As experience (overall) can exceed the integer maximum of 2.147b,
//         // we have to store it into a BIGINT, however, sequelize returns bigints
//         // as strings, to counter that, we convert every bigint to a JS number
//         return parseInt(this.getDataValue('threshold'), 10);
//       }
//     }
//   };

//   // Define other table options
//   const options = {
//     updatedAt: false,
//     indexes: [
//       {
//         unique: true,
//         fields: ['playerId', 'type']
//       },
//       {
//         fields: ['playerId']
//       },
//       {
//         fields: ['type']
//       }
//     ]
//   };

//   // Create the model
//   const Achievement = sequelize.define('achievements', achievementSchema, options);

//   // Define all model associations
//   Achievement.associate = models => {
//     Achievement.belongsTo(models.Player, {
//       foreignKey: 'playerId',
//       onDelete: 'CASCADE'
//     });
//   };

//   return Achievement;
// };
