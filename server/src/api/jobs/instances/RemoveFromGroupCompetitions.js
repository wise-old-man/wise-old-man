const competitionService = require("../../modules/competitions/competition.service");

module.exports = {
  key: "RemoveFromGroupCompetitions",
  async handle({ data }) {
    const { groupId, playerIds } = data;
    await competitionService.removeFromGroupCompetitions(groupId, playerIds);
  }
};
