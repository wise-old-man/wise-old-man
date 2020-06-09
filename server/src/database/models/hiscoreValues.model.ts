import { Column, DataType, Model } from 'sequelize-typescript';

export class HiscoreValues extends Model<HiscoreValues> {
    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    overallRank: Number;

    @Column({
        type: DataType.BIGINT,
        defaultValue: -1,
        allowNull: false,
        get() {
            // As experience (overall) can exceed the integer maximum of 2.147b,
            // we have to store it into a BIGINT, however, sequelize returns bigints
            // as strings, to counter that, we convert every bigint to a JS number
            return parseInt(this.getDataValue('overallExperience'), 10);
        }
    })
    overallExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    attackRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    attackExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    defenceRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    defenceExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    strengthRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    strengthExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    hitpointsRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    hitpointsExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    rangedRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    rangedExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    prayerRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    prayerExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    magicRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    magicExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    cookingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    cookingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    woodcuttingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    woodcuttingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    fletchingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    fletchingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    fishingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    fishingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    firemakingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    firemakingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    craftingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    craftingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    smithingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    smithingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    miningRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    miningExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    herbloreRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    herbloreExperience: Number;
    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    agilityRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    agilityExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    thievingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    thievingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    slayerRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    slayerExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    farmingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    farmingExperience: Number;
    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    runecraftingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    runecraftingExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    hunterRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    hunterExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    constructionRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    constructionExperience: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    league_pointsRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    league_pointsScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    bounty_hunter_hunterRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    bounty_hunter_hunterScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    bounty_hunter_rogueRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    bounty_hunter_rogueScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_allRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_allScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_beginnerRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_beginnerScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_easyRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_easyScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_mediumRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_mediumScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_hardRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_hardScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_eliteRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_eliteScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_masterRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    clue_scrolls_masterScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    last_man_standingRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    last_man_standingScore: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    abyssal_sireRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    abyssal_sireKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    alchemical_hydraRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    alchemical_hydraKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    barrows_chestsRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    barrows_chestsKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    bryophytaRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    bryophytaKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    callistoRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    callistoKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    cerberusRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    cerberusKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chambers_of_xericRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chambers_of_xericKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chambers_of_xeric_challenge_modeRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chambers_of_xeric_challenge_modeKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chaos_elementalRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chaos_elementalKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chaos_fanaticRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    chaos_fanaticKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    commander_zilyanaRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    commander_zilyanaKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    corporeal_beastRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    corporeal_beastKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    crazy_archaeologistRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    crazy_archaeologistKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    dagannoth_primeRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    dagannoth_primeKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    dagannoth_rexRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    dagannoth_rexKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    dagannoth_supremeRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    dagannoth_supremeKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    deranged_archaeologistRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    deranged_archaeologistKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    general_graardorRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    general_graardorKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    giant_moleRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    giant_moleKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    grotesque_guardiansRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    grotesque_guardiansKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    hesporiRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    hesporiKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    kalphite_queenRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    kalphite_queenKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    king_black_dragonRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    king_black_dragonKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    krakenRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    krakenKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    kreearraRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    kreearraKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    kril_tsutsarothRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    kril_tsutsarothKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    mimicRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    mimicKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    nightmareRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    nightmareKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    oborRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    oborKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    sarachnisRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    sarachnisKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    scorpiaRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    scorpiaKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    skotizoRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    skotizoKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    the_gauntletRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    the_gauntletKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    the_corrupted_gauntletRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    the_corrupted_gauntletKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    theatre_of_bloodRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    theatre_of_bloodKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    thermonuclear_smoke_devilRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    thermonuclear_smoke_devilKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    tzkal_zukRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    tzkal_zukKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    tztok_jadRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    tztok_jadKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    venenatisRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    venenatisKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    vetionRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    vetionKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    vorkathRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    vorkathKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    wintertodtRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    wintertodtKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    zalcanoRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    zalcanoKills: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    zulrahRank: Number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: -1,
        allowNull: false
    })
    zulrahKills: Number;
}