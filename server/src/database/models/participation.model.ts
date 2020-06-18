import { Table, Column, PrimaryKey, ForeignKey, Model, BelongsTo, DataType } from 'sequelize-typescript';
import { Player, Competition } from '.';

// Define other table options
const options = {
  modelName: 'participations',
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'competitionId']
    }
  ]
};

@Table(options)
export default class Participation extends Model<Participation> {
  @PrimaryKey
  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  playerId: number;

  @BelongsTo(() => Player)
  player: Player;

  @PrimaryKey
  @ForeignKey(() => Competition)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  competitionId: number;

  @BelongsTo(() => Competition)
  competition: Competition;
}

// export default (sequelize, DataTypes) => {
//   // Define the participation schema
//   const participationSchema = {
//     playerId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true
//     },
//     competitionId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true
//     }
//   };

//   // Define other table options
//   const options = {
//     indexes: [
//       {
//         unique: true,
//         fields: ['playerId', 'competitionId']
//       }
//     ]
//   };

//   // Create the model
//   const Participation = sequelize.define('participations', participationSchema, options);

//   Participation.associate = models => {
//     Participation.belongsTo(models.Player, {
//       foreignKey: 'playerId',
//       onDelete: 'CASCADE'
//     });
//     Participation.belongsTo(models.Competition, {
//       foreignKey: 'competitionId',
//       onDelete: 'CASCADE'
//     });
//   };

//   return Participation;
// };
