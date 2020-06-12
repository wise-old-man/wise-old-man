import { Table, Column, PrimaryKey, ForeignKey, Model } from 'sequelize-typescript';
import Player from './player.model';
import Competition from './competition.model';

// Define other table options
const options = {
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'competitionId']
    }
  ]
};

@Table(options)
export default class Participation extends Model<Participation> {

  @ForeignKey(() => Player)
  @PrimaryKey
  @Column({ onDelete: 'CASCADE' })
  playerId: Number;

  @ForeignKey(() => Competition)
  @PrimaryKey
  @Column({ onDelete: 'CASCADE' })
  competitionId: Number;
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
