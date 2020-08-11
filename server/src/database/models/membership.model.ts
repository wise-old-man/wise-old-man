import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { Group, Player } from 'database/models';
import { GROUP_ROLES } from 'api/constants';

// Define other table options
const options = {
  modelName: 'memberships',
  validate: {
    validateRole
  },
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'groupId']
    }
  ]
};

@Table(options)
export default class Membership extends Model<Membership> {
  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, primaryKey: true, onDelete: 'CASCADE' })
  playerId: number;

  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, primaryKey: true, onDelete: 'CASCADE' })
  groupId: number;

  @Default(GROUP_ROLES[0]) // member
  @Column({ type: DataType.ENUM(...GROUP_ROLES), allowNull: false })
  role: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;

  @BelongsTo(() => Group)
  group: Group;
}

function validateRole(this: Membership) {
  if (!GROUP_ROLES.includes(this.role)) {
    throw new Error('Invalid role.');
  }
}
