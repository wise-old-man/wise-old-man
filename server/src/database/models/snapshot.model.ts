import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull
} from 'sequelize-typescript';
import { SKILLS, BOSSES, ACTIVITIES, getRankKey, getValueKey } from '../../api/constants/metrics';

import { Player } from '.';
import HiscoreValues from './hiscoreValues.model';

// Define other table options
const options = {
  modelName: 'snapshots',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      fields: ['playerId']
    },
    {
      fields: ['createdAt']
    }
  ]
};

@Table(options)
export default class Snapshot extends HiscoreValues {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => Player)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  playerId: number;

  @Column({ type: DataType.DATE })
  importedAt: Date;

  @BelongsTo(() => Player)
  player: Player;
}
