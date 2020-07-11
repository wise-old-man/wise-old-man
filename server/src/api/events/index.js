const GroupMembersJoined = require('./instances/GroupMembersJoined');
const GroupMembersLeft = require('./instances/GroupMembersLeft');
const GroupMemberAchievements = require('./instances/GroupMemberAchievements');
const GroupCompetitionCreated = require('./instances/GroupCompetitionCreated');
const GroupCompetitionStarting = require('./instances/GroupCompetitionStarting');
const GroupCompetitionStarted = require('./instances/GroupCompetitionStarted');
const GroupCompetitionEnding = require('./instances/GroupCompetitionEnding');
const GroupCompetitionEnded = require('./instances/GroupCompetitionEnded');

const events = [
  GroupMembersJoined,
  GroupMembersLeft,
  GroupMemberAchievements,
  GroupCompetitionCreated,
  GroupCompetitionStarting,
  GroupCompetitionStarted,
  GroupCompetitionEnding,
  GroupCompetitionEnded
];

function dispatch(key, payload) {
  const event = events.find(e => e.key === key);

  if (event) {
    event.onDispatch(payload);
  }
}

exports.dispatch = dispatch;
