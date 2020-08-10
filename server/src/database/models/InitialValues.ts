import { BelongsTo, Column, DataType, ForeignKey, Table, UpdatedAt } from 'sequelize-typescript';
import { HiscoresValues, Player } from 'database/models';

// Define other table options
const options = {
  modelName: 'initialValues',
  createdAt: false,
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
export default class InitialValues extends HiscoresValues {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  playerId: number;

  @UpdatedAt
  updatedAt: Date;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;
}
