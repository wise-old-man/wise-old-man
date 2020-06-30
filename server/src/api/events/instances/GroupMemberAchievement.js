module.exports = {
  key: 'GroupMemberAchievement',
  onDispatch({ groupId, player, achievement }) {
    return {
      type: 'MEMBER_ACHIEVEMENT',
      data: { groupId, player, achievement }
    };
  }
};
