export default [
  {
    jobName: 'ScheduleGroupScoreUpdates',
    cronConfig: '0 8 * * *' // everyday at 8AM
  },
  {
    jobName: 'ScheduleCompetitionScoreUpdates',
    cronConfig: '0 */12 * * *' // every 12 hours
  },
  {
    jobName: 'RefreshNameChanges',
    cronConfig: '0 */8 * * *' // every 8 hours
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
