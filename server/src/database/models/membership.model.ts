import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Group, Player } from '.';
import { GROUP_ROLES } from '../../api/constants';

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
    type: DataType.ENUM(...GROUP_ROLES),
    allowNull: false,
    defaultValue: GROUP_ROLES[0],
    validate: {
      isIn: {
        args: [GROUP_ROLES],
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
