module.exports = {
  key: 'GroupCompetitionStarting',
  onDispatch({ competition, period }) {
    return {
      type: 'COMPETITION_STARTING',
      data: { groupId: competition.groupId, competition, period }
    };
  }
};
