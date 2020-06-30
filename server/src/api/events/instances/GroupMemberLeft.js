module.exports = {
  key: 'GroupMemberLeft',
  onDispatch({ groupId, playerId, displayName }) {
    return {
      type: 'GROUP_MEMBER_LEFT',
      data: { groupId, playerId, displayName }
    };
  }
};
