module.exports = {
  key: 'GroupCompetitionCreated',
  onDispatch({ competition }) {
    return {
      type: 'COMPETITION_CREATED',
      data: { groupId: competition.groupId, competition }
    };
  }
};
