module.exports = {
  key: 'GroupCompetitionEnded',
  onDispatch({ competition }) {
    const { groupId, participants } = competition;

    const standings = participants.map(({ displayName, progress }) => {
      return { displayName, gained: progress.gained };
    });

    return {
      type: 'COMPETITION_ENDED',
      data: { groupId, competition, standings }
    };
  }
};
