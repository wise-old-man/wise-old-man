module.exports = {
  key: 'GroupCompetitionEnding',
  onDispatch({ competition, period }) {
    return {
      type: 'COMPETITION_ENDING',
      data: { groupId: competition.groupId, competition, period }
    };
  }
};
