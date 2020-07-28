import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import {
  Achievement,
  Competition,
  Group,
  InitialValues,
  Membership,
  Participation,
  Record,
  Snapshot
} from '../../../database';
import { PLAYER_TYPES } from '../../constants';

// Define other table options
const options = {
  modelName: 'players',
  createdAt: 'registeredAt',
  validate: {
    validateUsername,
    validateDisplayName,
    validateType
  },
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      unique: true,
      fields: ['username']
    }
  ]
};

@Table(options)
export default class Player extends Model<Player> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  username: string;

  @Column({ type: DataType.STRING(20) })
  displayName: string;

  @Default(PLAYER_TYPES[0]) // unknown
  @Column({ type: DataType.ENUM(...PLAYER_TYPES), allowNull: false })
  type: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  flagged: boolean;

  @Column({ type: DataType.DATE })
  lastImportedAt: Date;

  @CreatedAt
  registeredAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsToMany(() => Competition, { as: 'participants', through: () => Participation })
  participants: Competition;

  @BelongsToMany(() => Group, { as: 'members', through: () => Membership })
  members: Group;

  @HasMany(() => Snapshot, 'playerId')
  snapshots: Snapshot[];

  @HasMany(() => Record, 'playerId')
  records: Record[];

  @HasMany(() => Achievement, 'playerId')
  achievements: Achievement[];

  @HasOne(() => InitialValues, 'playerId')
  initialValues: InitialValues;
}

function validateType(this: Player) {
  if (!PLAYER_TYPES.includes(this.type)) {
    throw new Error('Invalid player type.');
  }
}

function validateUsername(this: Player) {
  if (this.username.length < 1 || this.username.length > 12) {
    throw new Error('Username must be between 1 and 12 characters long.');
  }

  if (this.username.startsWith(' ') || this.username.endsWith(' ')) {
    throw new Error('Username cannot start or end with spaces.');
  }

  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(this.username)) {
    throw new Error('Username cannot contain any special characters.');
  }
}

function validateDisplayName(this: Player) {
  if (!this.displayName) {
    return;
  }

  if (this.displayName.length < 1 || this.displayName.length > 12) {
    throw new Error('Display name must be between 1 and 12 characters long.');
  }

  if (this.displayName.startsWith(' ') || this.displayName.endsWith(' ')) {
    throw new Error('Display name cannot start or end with spaces.');
  }

  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(this.displayName)) {
    throw new Error('Display name cannot contain any special characters.');
  }
}
