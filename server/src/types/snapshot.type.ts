export interface Snapshot {
  id: number;
  playerId: number;
  importedAt: Date | null;
  createdAt: Date;

  overallRank: number;
  overallExperience: number;
  overallLevel: number;

  attackRank: number;
  attackExperience: number;

  defenceRank: number;
  defenceExperience: number;

  strengthRank: number;
  strengthExperience: number;

  hitpointsRank: number;
  hitpointsExperience: number;

  rangedRank: number;
  rangedExperience: number;

  prayerRank: number;
  prayerExperience: number;

  magicRank: number;
  magicExperience: number;

  cookingRank: number;
  cookingExperience: number;

  woodcuttingRank: number;
  woodcuttingExperience: number;

  fletchingRank: number;
  fletchingExperience: number;

  fishingRank: number;
  fishingExperience: number;

  firemakingRank: number;
  firemakingExperience: number;

  craftingRank: number;
  craftingExperience: number;

  smithingRank: number;
  smithingExperience: number;

  miningRank: number;
  miningExperience: number;

  herbloreRank: number;
  herbloreExperience: number;

  agilityRank: number;
  agilityExperience: number;

  thievingRank: number;
  thievingExperience: number;

  slayerRank: number;
  slayerExperience: number;

  farmingRank: number;
  farmingExperience: number;

  runecraftingRank: number;
  runecraftingExperience: number;

  hunterRank: number;
  hunterExperience: number;

  constructionRank: number;
  constructionExperience: number;

  sailingRank: number;
  sailingExperience: number;

  league_pointsRank: number;
  league_pointsScore: number;

  bounty_hunter_hunterRank: number;
  bounty_hunter_hunterScore: number;

  bounty_hunter_rogueRank: number;
  bounty_hunter_rogueScore: number;

  clue_scrolls_allRank: number;
  clue_scrolls_allScore: number;

  clue_scrolls_beginnerRank: number;
  clue_scrolls_beginnerScore: number;

  clue_scrolls_easyRank: number;
  clue_scrolls_easyScore: number;

  clue_scrolls_mediumRank: number;
  clue_scrolls_mediumScore: number;

  clue_scrolls_hardRank: number;
  clue_scrolls_hardScore: number;

  clue_scrolls_eliteRank: number;
  clue_scrolls_eliteScore: number;

  clue_scrolls_masterRank: number;
  clue_scrolls_masterScore: number;

  last_man_standingRank: number;
  last_man_standingScore: number;

  pvp_arenaRank: number;
  pvp_arenaScore: number;

  soul_wars_zealRank: number;
  soul_wars_zealScore: number;

  guardians_of_the_riftRank: number;
  guardians_of_the_riftScore: number;

  colosseum_gloryRank: number;
  colosseum_gloryScore: number;

  collections_loggedRank: number;
  collections_loggedScore: number;

  abyssal_sireRank: number;
  abyssal_sireKills: number;

  alchemical_hydraRank: number;
  alchemical_hydraKills: number;

  amoxliatlRank: number;
  amoxliatlKills: number;

  araxxorRank: number;
  araxxorKills: number;

  artioRank: number;
  artioKills: number;

  barrows_chestsRank: number;
  barrows_chestsKills: number;

  bryophytaRank: number;
  bryophytaKills: number;

  cerberusRank: number;
  cerberusKills: number;

  callistoRank: number;
  callistoKills: number;

  calvarionRank: number;
  calvarionKills: number;

  chambers_of_xericRank: number;
  chambers_of_xericKills: number;

  chambers_of_xeric_challenge_modeRank: number;
  chambers_of_xeric_challenge_modeKills: number;

  chaos_elementalRank: number;
  chaos_elementalKills: number;

  chaos_fanaticRank: number;
  chaos_fanaticKills: number;

  commander_zilyanaRank: number;
  commander_zilyanaKills: number;

  corporeal_beastRank: number;
  corporeal_beastKills: number;

  crazy_archaeologistRank: number;
  crazy_archaeologistKills: number;

  dagannoth_primeRank: number;
  dagannoth_primeKills: number;

  dagannoth_rexRank: number;
  dagannoth_rexKills: number;

  dagannoth_supremeRank: number;
  dagannoth_supremeKills: number;

  deranged_archaeologistRank: number;
  deranged_archaeologistKills: number;

  doom_of_mokhaiotlRank: number;
  doom_of_mokhaiotlKills: number;

  duke_sucellusRank: number;
  duke_sucellusKills: number;

  general_graardorRank: number;
  general_graardorKills: number;

  giant_moleRank: number;
  giant_moleKills: number;

  grotesque_guardiansRank: number;
  grotesque_guardiansKills: number;

  hesporiRank: number;
  hesporiKills: number;

  kalphite_queenRank: number;
  kalphite_queenKills: number;

  king_black_dragonRank: number;
  king_black_dragonKills: number;

  krakenRank: number;
  krakenKills: number;

  kreearraRank: number;
  kreearraKills: number;

  kril_tsutsarothRank: number;
  kril_tsutsarothKills: number;

  lunar_chestsRank: number;
  lunar_chestsKills: number;

  mimicRank: number;
  mimicKills: number;

  nexRank: number;
  nexKills: number;

  nightmareRank: number;
  nightmareKills: number;

  phosanis_nightmareRank: number;
  phosanis_nightmareKills: number;

  oborRank: number;
  oborKills: number;

  phantom_muspahRank: number;
  phantom_muspahKills: number;

  sarachnisRank: number;
  sarachnisKills: number;

  scorpiaRank: number;
  scorpiaKills: number;

  scurriusRank: number;
  scurriusKills: number;

  shellbane_gryphonRank: number;
  shellbane_gryphonKills: number;

  skotizoRank: number;
  skotizoKills: number;

  sol_hereditRank: number;
  sol_hereditKills: number;

  spindelRank: number;
  spindelKills: number;

  temporossRank: number;
  temporossKills: number;

  the_gauntletRank: number;
  the_gauntletKills: number;

  the_corrupted_gauntletRank: number;
  the_corrupted_gauntletKills: number;

  the_hueycoatlRank: number;
  the_hueycoatlKills: number;

  the_leviathanRank: number;
  the_leviathanKills: number;

  the_royal_titansRank: number;
  the_royal_titansKills: number;

  the_whispererRank: number;
  the_whispererKills: number;

  theatre_of_bloodRank: number;
  theatre_of_bloodKills: number;

  theatre_of_blood_hard_modeRank: number;
  theatre_of_blood_hard_modeKills: number;

  thermonuclear_smoke_devilRank: number;
  thermonuclear_smoke_devilKills: number;

  tombs_of_amascutRank: number;
  tombs_of_amascutKills: number;

  tombs_of_amascut_expertRank: number;
  tombs_of_amascut_expertKills: number;

  tzkal_zukRank: number;
  tzkal_zukKills: number;

  tztok_jadRank: number;
  tztok_jadKills: number;

  vardorvisRank: number;
  vardorvisKills: number;

  venenatisRank: number;
  venenatisKills: number;

  vetionRank: number;
  vetionKills: number;

  vorkathRank: number;
  vorkathKills: number;

  wintertodtRank: number;
  wintertodtKills: number;

  yamaRank: number;
  yamaKills: number;

  zalcanoRank: number;
  zalcanoKills: number;

  zulrahRank: number;
  zulrahKills: number;

  ehpRank: number;
  ehpValue: number;

  ehbRank: number;
  ehbValue: number;
}
