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
import { GroupRole } from '@wise-old-man/utils';
import { Group, Player } from '../../database/models';

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
  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, primaryKey: true, onDelete: 'CASCADE' })
  playerId: number;

  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, primaryKey: true, onDelete: 'CASCADE' })
  groupId: number;

  @Default('member')
  @Column({ type: DataType.STRING(40), set: setRole, get: parseRole, allowNull: false })
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

export function adaptRole(role: string) {
  if (role === 'deputy_owner') return 'deputy owner';
  if (role === 'gnome_child') return 'gnome child';
  if (role === 'gnome_elder') return 'gnome elder';
  if (role === 'record_chaser') return 'record-chaser';
  if (role === 'red_topaz') return 'red topaz';
  if (role === 'short_green_guy') return 'short green guy';
  if (role === 'speed_runner') return 'speed-runner';

  return role;
}

function parseRole(this: any) {
  return adaptRole(this.getDataValue('role'));
}

function setRole(role: any) {
  this.setDataValue('role', String(role).replace(/ /g, '_').replace(/-/g, '_'));
}
