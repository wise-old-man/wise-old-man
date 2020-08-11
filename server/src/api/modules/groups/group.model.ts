import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { Membership } from '../../../database';
import Player from '../players/player.model';

// Define other table options
const options = {
  modelName: 'groups',
  validate: {
    validateName
  },
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      unique: true,
      fields: ['name']
    }
  ]
};

@Table(options)
export default class Group extends Model<Group> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(30), allowNull: false, unique: uniqueCheck() })
  name: string;

  @Column({ type: DataType.STRING(20) })
  clanChat: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  score: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  verified: boolean;

  @Column({ type: DataType.VIRTUAL, allowNull: false })
  verificationCode: string;

  @Column({ type: DataType.STRING, allowNull: false })
  verificationHash: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsToMany(() => Player, { as: 'members', through: () => Membership })
  members: Player[];
}

function validateName(this: Group): void {
  if (this.name.length < 1) {
    throw new Error('Group name must have atleast one character.');
  }

  if (this.name.length > 30) {
    throw new Error('Group name must be shorter than 30 characters.');
  }
}

function uniqueCheck() {
  return {
    name: 'name',
    msg: 'This group name is already taken.'
  };
}
