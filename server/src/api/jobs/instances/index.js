const ImportPlayer = require('./ImportPlayer');
const UpdatePlayer = require('./UpdatePlayer');
const SyncPlayerRecords = require('./SyncPlayerRecords');
const SyncPlayerAchievements = require('./SyncPlayerAchievements');
const AddToGroupCompetitions = require('./AddToGroupCompetitions');
const RemoveFromGroupCompetitions = require('./RemoveFromGroupCompetitions');
const ReevaluatePlayerAchievements = require('./ReevaluatePlayerAchievements');
const SyncPlayerInitialValues = require('./SyncPlayerInitialValues');
const AssertPlayerName = require('./AssertPlayerName');
const RefreshRankings = require('./RefreshRankings');
const CompetitionStarted = require('./CompetitionStarted');
const CompetitionStarting = require('./CompetitionStarting');
const CompetitionEnding = require('./CompetitionEnding');
const CompetitionEnded = require('./CompetitionEnded');

module.exports = {
  ImportPlayer,
  UpdatePlayer,
  SyncPlayerRecords,
  SyncPlayerAchievements,
  AddToGroupCompetitions,
  RemoveFromGroupCompetitions,
  ReevaluatePlayerAchievements,
  SyncPlayerInitialValues,
  AssertPlayerName,
  RefreshRankings,
  CompetitionStarted,
  CompetitionStarting,
  CompetitionEnding,
  CompetitionEnded
};
