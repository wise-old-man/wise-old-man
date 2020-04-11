export default [
  {
    name: 'Snapshot',
    description: "Represents player's stats at a specific date.",
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The snapshot's unique id",
      },
      {
        field: 'playerId',
        type: 'integer',
        description: 'The id of the corresponding player.',
      },
      {
        field: 'importedAt',
        type: 'date',
        description: 'The date at which the snapshot was imported.',
      },
      {
        field: 'createdAt',
        type: 'date',
        description: 'The date at which the snapshot was created.',
      },
      {
        field: 'overallExperience',
        type: 'integer',
        description: 'overall experience value.',
      },
      {
        field: 'overallRank',
        type: 'integer',
        description: 'overall rank value.',
      },
      {
        field: 'attackExperience',
        type: 'integer',
        description: 'attack experience value.',
      },
      {
        field: 'attackRank',
        type: 'integer',
        description: 'attack rank value.',
      },
      {
        field: 'defenceExperience',
        type: 'integer',
        description: 'defence experience value.',
      },
      {
        field: 'defenceRank',
        type: 'integer',
        description: 'defence rank value.',
      },
      {
        field: 'strengthExperience',
        type: 'integer',
        description: 'strength experience value.',
      },
      {
        field: 'strengthRank',
        type: 'integer',
        description: 'strength rank value.',
      },
      {
        field: 'hitpointsExperience',
        type: 'integer',
        description: 'hitpoints experience value.',
      },
      {
        field: 'hitpointsRank',
        type: 'integer',
        description: 'hitpoints rank value.',
      },
      {
        field: 'rangedExperience',
        type: 'integer',
        description: 'ranged experience value.',
      },
      {
        field: 'rangedRank',
        type: 'integer',
        description: 'ranged rank value.',
      },
      {
        field: 'prayerExperience',
        type: 'integer',
        description: 'prayer experience value.',
      },
      {
        field: 'prayerRank',
        type: 'integer',
        description: 'prayer rank value.',
      },
      {
        field: 'magicExperience',
        type: 'integer',
        description: 'magic experience value.',
      },
      {
        field: 'magicRank',
        type: 'integer',
        description: 'magic rank value.',
      },
      {
        field: 'cookingExperience',
        type: 'integer',
        description: 'cooking experience value.',
      },
      {
        field: 'cookingRank',
        type: 'integer',
        description: 'cooking rank value.',
      },
      {
        field: 'woodcuttingExperience',
        type: 'integer',
        description: 'woodcutting experience value.',
      },
      {
        field: 'woodcuttingRank',
        type: 'integer',
        description: 'woodcutting rank value.',
      },
      {
        field: 'fletchingExperience',
        type: 'integer',
        description: 'fletching experience value.',
      },
      {
        field: 'fletchingRank',
        type: 'integer',
        description: 'fletching rank value.',
      },
      {
        field: 'fishingExperience',
        type: 'integer',
        description: 'fishing experience value.',
      },
      {
        field: 'fishingRank',
        type: 'integer',
        description: 'fishing rank value.',
      },
      {
        field: 'firemakingExperience',
        type: 'integer',
        description: 'firemaking experience value.',
      },
      {
        field: 'firemakingRank',
        type: 'integer',
        description: 'firemaking rank value.',
      },
      {
        field: 'craftingExperience',
        type: 'integer',
        description: 'crafting experience value.',
      },
      {
        field: 'craftingRank',
        type: 'integer',
        description: 'crafting rank value.',
      },
      {
        field: 'smithingExperience',
        type: 'integer',
        description: 'smithing experience value.',
      },
      {
        field: 'smithingRank',
        type: 'integer',
        description: 'smithing rank value.',
      },
      {
        field: 'miningExperience',
        type: 'integer',
        description: 'mining experience value.',
      },
      {
        field: 'miningRank',
        type: 'integer',
        description: 'mining rank value.',
      },
      {
        field: 'herbloreExperience',
        type: 'integer',
        description: 'herblore experience value.',
      },
      {
        field: 'herbloreRank',
        type: 'integer',
        description: 'herblore rank value.',
      },
      {
        field: 'agilityExperience',
        type: 'integer',
        description: 'agility experience value.',
      },
      {
        field: 'agilityRank',
        type: 'integer',
        description: 'agility rank value.',
      },
      {
        field: 'thievingExperience',
        type: 'integer',
        description: 'thieving experience value.',
      },
      {
        field: 'thievingRank',
        type: 'integer',
        description: 'thieving rank value.',
      },
      {
        field: 'slayerExperience',
        type: 'integer',
        description: 'slayer experience value.',
      },
      {
        field: 'slayerRank',
        type: 'integer',
        description: 'slayer rank value.',
      },
      {
        field: 'farmingExperience',
        type: 'integer',
        description: 'farming experience value.',
      },
      {
        field: 'farmingRank',
        type: 'integer',
        description: 'farming rank value.',
      },
      {
        field: 'runecraftingExperience',
        type: 'integer',
        description: 'runecrafting experience value.',
      },
      {
        field: 'runecraftingRank',
        type: 'integer',
        description: 'runecrafting rank value.',
      },
      {
        field: 'hunterExperience',
        type: 'integer',
        description: 'hunter experience value.',
      },
      {
        field: 'hunterRank',
        type: 'integer',
        description: 'hunter rank value.',
      },
      {
        field: 'constructionExperience',
        type: 'integer',
        description: 'construction experience value.',
      },
      {
        field: 'constructionRank',
        type: 'integer',
        description: 'construction rank value.',
      },
    ],
  },
  {
    name: 'Periods',
    description:
      'All the possible values for the "period" field (used for filtering in the endpoint below).',
    values: ['day', 'week', 'month', 'year'],
  },
];
