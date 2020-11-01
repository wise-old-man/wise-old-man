import { Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';

// Define other table options
const options = {
  modelName: 'leaguePages',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id']
    }
  ]
};

@Table(options)
export default class LeaguePage extends Model<LeaguePage> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  pageIndex: number;

  @CreatedAt
  createdAt: Date;
}
