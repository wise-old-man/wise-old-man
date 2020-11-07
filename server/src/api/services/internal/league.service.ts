import { LeaguePage } from '../../../database/models';

const TIERS = [
  { name: 'bronze', threshold: 100 },
  { name: 'iron', threshold: 80 },
  { name: 'steel', threshold: 60 },
  { name: 'mithril', threshold: 40 },
  { name: 'adamant', threshold: 20 },
  { name: 'rune', threshold: 5 },
  { name: 'dragon', threshold: 1 }
];

async function getPlayerTier(leaguePointsRank: number) {
  if (!leaguePointsRank) return TIERS[0].name;

  const tierThresholds = await getTierRankThresholds();
  const playerTier = tierThresholds.reverse().find(tier => tier.threshold > leaguePointsRank);

  return playerTier.name || TIERS[0].name;
}

async function getTierRankThresholds() {
  const lastPageIndex = await getLatestPage();
  const lastRank = lastPageIndex * 25;

  return TIERS.map(t => {
    return { ...t, threshold: Math.floor((t.threshold / 100) * lastRank) };
  });
}

async function getLatestPage(): Promise<number> {
  const result = await LeaguePage.findOne({
    order: [['createdAt', 'DESC']]
  });

  return result ? result.pageIndex : -1;
}

async function updateLatestPage(newPageIndex: number) {
  await LeaguePage.create({ pageIndex: newPageIndex });
}

export { getLatestPage, updateLatestPage, getTierRankThresholds, getPlayerTier };
