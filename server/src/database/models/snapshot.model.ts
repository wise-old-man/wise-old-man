import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { HiscoresValues, Player } from '../../database/models';

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
export default class Snapshot extends HiscoresValues {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  playerId: number;

  @Column({ type: DataType.VIRTUAL, allowNull: false, defaultValue: false })
  isChange: boolean;

  @Column({ type: DataType.DATE })
  importedAt: Date;

  @CreatedAt
  createdAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;
}
