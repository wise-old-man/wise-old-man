import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Model,
  BelongsToMany,
  AllowNull,
  Default
} from 'sequelize-typescript';
import { Player, Membership } from '.';

// Define other table options
const options = {
  modelName: 'groups',
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
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(30),
    unique: {
      msg: 'This group name is already taken.',
      name: 'name'
    },
    validate: {
      len: {
        args: [1, 30],
        msg: 'Group title must be between 1 and 30 characters long.'
      }
    }
  })
  name: string;

  @Column({ type: DataType.STRING(20) })
  clanChat: string;

  @Default(0)
  @Column({ type: DataType.INTEGER })
  score: number;

  @AllowNull(false)
  @Column({ type: DataType.VIRTUAL })
  verificationCode: any;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  verificationHash: string;

  @BelongsToMany(() => Player, {
    as: 'members',
    through: () => Membership
  })
  members: Player[];
}
