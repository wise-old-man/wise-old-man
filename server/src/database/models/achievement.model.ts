import { Table, Column, DataType, PrimaryKey, Index, Unique, Model, ForeignKey } from 'sequelize-typescript';
import { Player } from './player.model';

// Define other table options
const options = {
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
export class Achievement extends Model<Achievement> {

  @ForeignKey(() => Player)
  @PrimaryKey
  @Column({ allowNull: false, onDelete: 'CASCADE' })
  playerId: Number;

  @PrimaryKey
  @Column({ allowNull: false })
  type: String;

  @Column
  metric: String;

  @Column({
    type: DataType.BIGINT,
    get() {
      return parseInt(this.getDataValue('threshold', 10));
    }
  })
  threshold: Number;

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
