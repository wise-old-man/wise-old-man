import { BelongsTo, Column, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { Player } from '../../database/models';

// Define other table options
const options = {
  modelName: 'deltas',
  createdAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id']
    },
    {
      unique: true,
      fields: ['playerId', 'period']
    },
    {
      fields: ['playerId']
    },
    {
      fields: ['period']
    }
  ]
};

@Table(options)
export default class Delta extends Model<Delta> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  playerId: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  period: string;

  @Column({ type: DataType.DATE, allowNull: false })
  startedAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  endedAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  overall: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  attack: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  defence: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  strength: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  hitpoints: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  ranged: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  prayer: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  magic: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  cooking: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  woodcutting: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  fletching: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  fishing: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  firemaking: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  crafting: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  smithing: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  mining: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  herblore: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  agility: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  thieving: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  slayer: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  farming: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  runecrafting: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  hunter: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  construction: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  league_points: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  bounty_hunter_hunter: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  bounty_hunter_rogue: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  clue_scrolls_all: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  clue_scrolls_beginner: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  clue_scrolls_easy: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  clue_scrolls_medium: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  clue_scrolls_hard: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  clue_scrolls_elite: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  clue_scrolls_master: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  last_man_standing: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  soul_wars_zeal: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  abyssal_sire: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  alchemical_hydra: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  barrows_chests: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  bryophyta: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  callisto: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  cerberus: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  chambers_of_xeric: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  chambers_of_xeric_challenge_mode: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  chaos_elemental: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  chaos_fanatic: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  commander_zilyana: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  corporeal_beast: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  crazy_archaeologist: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  dagannoth_prime: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  dagannoth_rex: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  dagannoth_supreme: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  deranged_archaeologist: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  general_graardor: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  giant_mole: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  grotesque_guardians: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  hespori: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  kalphite_queen: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  king_black_dragon: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  kraken: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  kreearra: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  kril_tsutsaroth: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  mimic: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  nightmare: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  obor: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  sarachnis: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  scorpia: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  skotizo: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  tempoross: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  the_gauntlet: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  the_corrupted_gauntlet: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  theatre_of_blood: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  thermonuclear_smoke_devil: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  tzkal_zuk: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  tztok_jad: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  venenatis: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  vetion: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  vorkath: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  wintertodt: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  zalcano: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  zulrah: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  ehp: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  ehb: number;

  /* Associations */

  @BelongsTo(() => Player)
  player: Player;
}
