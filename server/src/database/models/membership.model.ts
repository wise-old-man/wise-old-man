import { Table, Column, DataType, PrimaryKey, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ROLES } from '../../api/constants/roles';
import { Player, Group } from '.';

// Define other table options
const options = {
  modelName: 'memberships',
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'groupId']
    }
  ]
};

@Table(options)
export default class Membership extends Model<Membership> {
  @PrimaryKey
  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  playerId: number;

  @PrimaryKey
  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  groupId: number;

  @Column({
    type: DataType.ENUM(...ROLES),
    allowNull: false,
    defaultValue: ROLES[0],
    validate: {
      isIn: {
        args: [ROLES],
        msg: 'Invalid role'
      }
    }
  })
  role: string;

  @BelongsTo(() => Player)
  player: Player;

  @BelongsTo(() => Group)
  group: Group;
}
