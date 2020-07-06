const GroupMemberJoined = require('./instances/GroupMemberJoined');
const GroupMemberLeft = require('./instances/GroupMemberLeft');
const GroupMemberAchievement = require('./instances/GroupMemberAchievement');
const GroupCompetitionCreated = require('./instances/GroupCompetitionCreated');
const GroupCompetitionStarting = require('./instances/GroupCompetitionStarting');
const GroupCompetitionStarted = require('./instances/GroupCompetitionStarted');
const GroupCompetitionEnded = require('./instances/GroupCompetitionEnded');

const events = [
  GroupMemberJoined,
  GroupMemberLeft,
  GroupMemberAchievement,
  GroupCompetitionCreated,
  GroupCompetitionStarting,
  GroupCompetitionStarted,
  GroupCompetitionEnded
];

function dispatch(key, payload) {
  const event = events.find(e => e.key === key);

  if (event) {
    event.onDispatch(payload);
  }
}

exports.dispatch = dispatch;
