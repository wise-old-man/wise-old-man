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
    jobName: 'ScheduleCompetitionEvents',
    cronConfig: '* * * * *' // every 1 min
  },
  {
    jobName: 'InvalidateDeltas',
    cronConfig: '0 */6 * * *' // every 6 hours
  }
];
