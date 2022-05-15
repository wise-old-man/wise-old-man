import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import {
  Achievement,
  Competition,
  Group,
  Membership,
  NameChange,
  Participation,
  Record,
  Snapshot
} from '../../database/models';

// Define other table options
const options = {
  modelName: 'players',
  createdAt: 'registeredAt',
  validate: {
    validateUsername,
    validateDisplayName
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

  @Default('unknown')
  @Column({
    type: DataType.ENUM(...['unknown', 'regular', 'ironman', 'hardcore', 'ultimate']),
    allowNull: false
  })
  type: string;

  @Column({
    type: DataType.ENUM(...['main', 'f2p', 'lvl3', 'zerker', 'def1', 'hp10']),
    allowNull: false,
    defaultValue: 'main'
  })
  build: string;

  @Column({ type: DataType.STRING(3) })
  country: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  flagged: boolean;

  @Column({ type: DataType.BIGINT, get: parseExp, allowNull: false, defaultValue: 0 })
  exp: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  ehp: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  ehb: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  ttm: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  tt200m: number;

  @Column({ type: DataType.DATE })
  lastImportedAt: Date;

  @Column({ type: DataType.DATE })
  lastChangedAt: Date;

  @CreatedAt
  registeredAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsToMany(() => Competition, { as: 'participants', through: () => Participation })
  participants: Competition;

  @BelongsToMany(() => Group, { as: 'members', through: () => Membership })
  members: Group;

  @HasMany(() => NameChange, 'playerId')
  nameChanges: NameChange[];

  @HasMany(() => Snapshot, 'playerId')
  snapshots: Snapshot[];

  @HasMany(() => Record, 'playerId')
  records: Record[];

  @HasMany(() => Achievement, 'playerId')
  achievements: Achievement[];
}

/**
 * As experience (overall) can exceed the integer maximum of 2.147b,
 * we have to store it into a BIGINT, however, sequelize returns bigints
 * as strings, to counter that, we convert every bigint to a JS number
 */
function parseExp(this: any) {
  return parseInt(this.getDataValue('exp', 10));
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
