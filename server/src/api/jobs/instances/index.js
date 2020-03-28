const ConfirmPlayerType = require("./ConfirmPlayerType");
const ImportPlayer = require("./ImportPlayer");
const UpdatePlayer = require("./UpdatePlayer");
const SyncPlayerDeltas = require("./SyncPlayerDeltas");
const SyncPlayerRecords = require("./SyncPlayerRecords");
const SyncPlayerParticipations = require("./SyncPlayerParticipations");
const SyncPlayerAchievements = require("./SyncPlayerAchievements");
const AddToGroupCompetitions = require("./AddToGroupCompetitions");
const RemoveFromGroupCompetitions = require("./RemoveFromGroupCompetitions");

module.exports = {
  ImportPlayer,
  UpdatePlayer,
  ConfirmPlayerType,
  SyncPlayerDeltas,
  SyncPlayerRecords,
  SyncPlayerParticipations,
  SyncPlayerAchievements,
  AddToGroupCompetitions,
  RemoveFromGroupCompetitions
};
