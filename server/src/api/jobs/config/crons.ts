export default [
  {
    jobName: 'RefreshGroupRankings',
    cronConfig: '0 */6 * * *' // every 6 hours
  },
  {
    jobName: 'RefreshCompetitionRankings',
    cronConfig: '0 */6 * * *' // every 6 hours
  },
  {
    jobName: 'RefreshNameChanges',
    cronConfig: '0 */3 * * *' // every 3 hours
  }
];
