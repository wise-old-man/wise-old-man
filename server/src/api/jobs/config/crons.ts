export default [
  {
    jobName: 'RefreshRankings',
    cronConfig: '0 */6 * * *' // every 6 hours
  },
  {
    jobName: 'CheckLeagueRanks',
    cronConfig: '*/5 * * * *'
  }
];
