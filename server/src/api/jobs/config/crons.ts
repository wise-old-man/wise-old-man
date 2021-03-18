export default [
  {
    jobName: 'RefreshGroupRankings',
    cronConfig: '0 */12 * * *' // every 12 hours
  },
  {
    jobName: 'RefreshCompetitionRankings',
    cronConfig: '0 */6 * * *' // every 6 hours
  },
  {
    jobName: 'RefreshNameChanges',
    cronConfig: '0 */8 * * *' // every 8 hours
  }
];
