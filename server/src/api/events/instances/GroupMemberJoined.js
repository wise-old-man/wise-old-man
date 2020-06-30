module.exports = {
  key: 'GroupMemberJoined',
  onDispatch({ groupId, playerId, displayName }) {
    return {
      type: 'GROUP_MEMBER_JOINED',
      data: { groupId, playerId, displayName }
    };
  }
};
