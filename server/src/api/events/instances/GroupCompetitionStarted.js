module.exports = {
  key: 'GroupCompetitionStarted',
  onDispatch({ competition }) {
    return {
      type: 'COMPETITION_STARTED',
      data: { groupId: competition.groupId, competition }
    };
  }
};
