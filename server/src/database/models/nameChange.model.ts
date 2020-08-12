import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { Player } from '../../database/models';
import { NameChangeStatus } from '../../types';

// Define other table options
const options = {
  modelName: 'nameChanges',
  validate: {
    validateOldName,
    validateNewName
  },
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['playerId']
    }
  ]
};

@Table(options)
export default class NameChange extends Model<NameChange> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  playerId: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  oldName: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  newName: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  status: NameChangeStatus;

  @Column({ type: DataType.DATE })
  resolvedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;
}

function validateOldName(this: NameChange) {
  if (this.oldName.length < 1 || this.oldName.length > 12) {
    throw new Error('Old username must be between 1 and 12 characters long.');
  }

  if (this.oldName.startsWith(' ') || this.oldName.endsWith(' ')) {
    throw new Error('Old username cannot start or end with spaces.');
  }

  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(this.oldName)) {
    throw new Error('Old username cannot contain any special characters.');
  }
}

function validateNewName(this: NameChange) {
  if (this.newName.length < 1 || this.newName.length > 12) {
    throw new Error('New username must be between 1 and 12 characters long.');
  }

  if (this.newName.startsWith(' ') || this.newName.endsWith(' ')) {
    throw new Error('New username cannot start or end with spaces.');
  }

  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(this.newName)) {
    throw new Error('New username cannot contain any special characters.');
  }
}
