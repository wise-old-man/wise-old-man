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
import { GroupRole, GROUP_ROLES } from '@wise-old-man/utils';
import { Group, Player } from '../../database/models';

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

  @Default('member')
  @Column({ type: DataType.STRING(40), allowNull: false })
  role: GroupRole;

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
    throw new Error(`Invalid role "${this.role}".`);
  }
}
