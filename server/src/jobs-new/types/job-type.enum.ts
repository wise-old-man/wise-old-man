export enum JobType {
  ASSERT_PLAYER_TYPE = 'assert-player-type',
  INVALIDATE_DELTAS = 'invalidate-deltas',
  SCHEDULE_COMPETITION_SCORE_UPDATES = 'schedule-competition-score-updates',
  SCHEDULE_GROUP_SCORE_UPDATES = 'schedule-group-score-updates',
  SCHEDULE_PATRON_GROUP_UPDATES = 'schedule-patron-group-updates',
  SCHEDULE_PATRON_PLAYER_UPDATES = 'schedule-patron-player-updates',
  SYNC_API_KEYS = 'sync-api-keys',
  SYNC_PATRONS = 'sync-patrons',
  SYNC_PLAYER_ACHIEVEMENTS = 'sync-player-achievements',
  SYNC_PLAYER_COMPETITION_PARTICIPATIONS = 'sync-player-competition-participations',
  SYNC_PLAYER_DELTAS = 'sync-player-deltas',
  SYNC_PLAYER_RECORDS = 'sync-player-records',
  UPDATE_COMPETITION_SCORE = 'update-competition-score',
  UPDATE_GROUP_SCORE = 'update-group-score',
  UPDATE_PLAYER = 'update-player',
  UPDATE_QUEUE_METRICS = 'update-queue-metrics'
}
