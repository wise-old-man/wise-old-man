const ImportPlayer = require('./ImportPlayer');
const UpdatePlayer = require('./UpdatePlayer');
const SyncPlayerRecords = require('./SyncPlayerRecords');
const SyncPlayerParticipations = require('./SyncPlayerParticipations');
const SyncPlayerAchievements = require('./SyncPlayerAchievements');
const AddToGroupCompetitions = require('./AddToGroupCompetitions');
const RemoveFromGroupCompetitions = require('./RemoveFromGroupCompetitions');
const ReevaluatePlayerAchievements = require('./ReevaluatePlayerAchievements');

module.exports = {
  ImportPlayer,
  UpdatePlayer,
  SyncPlayerRecords,
  SyncPlayerParticipations,
  SyncPlayerAchievements,
  AddToGroupCompetitions,
  RemoveFromGroupCompetitions,
  ReevaluatePlayerAchievements
};
