import { Column, DataType, Model } from 'sequelize-typescript';

export default class HiscoresValues extends Model<HiscoresValues> {
  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  overallRank: number;

  @Column({ type: DataType.BIGINT, defaultValue: -1, allowNull: false, get: parseOverall })
  overallExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  attackRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  attackExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  defenceRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  defenceExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  strengthRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  strengthExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  hitpointsRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  hitpointsExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  rangedRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  rangedExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  prayerRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  prayerExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  magicRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  magicExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  cookingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  cookingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  woodcuttingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  woodcuttingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  fletchingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  fletchingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  fishingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  fishingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  firemakingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  firemakingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  craftingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  craftingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  smithingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  smithingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  miningRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  miningExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  herbloreRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  herbloreExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  agilityRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  agilityExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  thievingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  thievingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  slayerRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  slayerExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  farmingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  farmingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  runecraftingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  runecraftingExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  hunterRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  hunterExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  constructionRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  constructionExperience: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  league_pointsRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  league_pointsScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  bounty_hunter_hunterRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  bounty_hunter_hunterScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  bounty_hunter_rogueRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  bounty_hunter_rogueScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_allRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_allScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_beginnerRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_beginnerScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_easyRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_easyScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_mediumRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_mediumScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_hardRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_hardScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_eliteRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_eliteScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_masterRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  clue_scrolls_masterScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  last_man_standingRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  last_man_standingScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  soul_wars_zealRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  soul_wars_zealScore: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  abyssal_sireRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  abyssal_sireKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  alchemical_hydraRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  alchemical_hydraKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  barrows_chestsRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  barrows_chestsKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  bryophytaRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  bryophytaKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  callistoRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  callistoKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  cerberusRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  cerberusKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chambers_of_xericRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chambers_of_xericKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chambers_of_xeric_challenge_modeRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chambers_of_xeric_challenge_modeKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chaos_elementalRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chaos_elementalKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chaos_fanaticRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  chaos_fanaticKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  commander_zilyanaRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  commander_zilyanaKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  corporeal_beastRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  corporeal_beastKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  crazy_archaeologistRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  crazy_archaeologistKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  dagannoth_primeRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  dagannoth_primeKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  dagannoth_rexRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  dagannoth_rexKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  dagannoth_supremeRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  dagannoth_supremeKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  deranged_archaeologistRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  deranged_archaeologistKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  general_graardorRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  general_graardorKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  giant_moleRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  giant_moleKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  grotesque_guardiansRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  grotesque_guardiansKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  hesporiRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  hesporiKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  kalphite_queenRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  kalphite_queenKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  king_black_dragonRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  king_black_dragonKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  krakenRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  krakenKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  kreearraRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  kreearraKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  kril_tsutsarothRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  kril_tsutsarothKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  mimicRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  mimicKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  nightmareRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  nightmareKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  oborRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  oborKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  sarachnisRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  sarachnisKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  scorpiaRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  scorpiaKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  skotizoRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  skotizoKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  temporossRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  temporossKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  the_gauntletRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  the_gauntletKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  the_corrupted_gauntletRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  the_corrupted_gauntletKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  theatre_of_bloodRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  theatre_of_bloodKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  theatre_of_blood_hard_modeRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  theatre_of_blood_hard_modeKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  thermonuclear_smoke_devilRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  thermonuclear_smoke_devilKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  tzkal_zukRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  tzkal_zukKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  tztok_jadRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  tztok_jadKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  venenatisRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  venenatisKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  vetionRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  vetionKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  vorkathRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  vorkathKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  wintertodtRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  wintertodtKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  zalcanoRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  zalcanoKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  zulrahRank: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  zulrahKills: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  ehpRank: number;

  @Column({ type: DataType.FLOAT, defaultValue: -1, allowNull: false })
  ehpValue: number;

  @Column({ type: DataType.INTEGER, defaultValue: -1, allowNull: false })
  ehbRank: number;

  @Column({ type: DataType.FLOAT, defaultValue: -1, allowNull: false })
  ehbValue: number;
}

function parseOverall(this: any) {
  // As experience (overall) can exceed the integer maximum of 2.147b,
  // we have to store it into a BIGINT, however, sequelize returns bigints
  // as strings, to counter that, we convert every bigint to a JS number
  return parseInt(this.getDataValue('overallExperience'), 10);
}
