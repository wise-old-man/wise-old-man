import GroupMembersJoined from './instances/GroupMembersJoined';
import GroupMembersLeft from './instances/GroupMembersLeft';
import GroupMemberAchievements from './instances/GroupMemberAchievements';
import GroupCompetitionCreated from './instances/GroupCompetitionCreated';
import GroupCompetitionStarting from './instances/GroupCompetitionStarting';
import GroupCompetitionStarted from './instances/GroupCompetitionStarted';
import GroupCompetitionEnding from './instances/GroupCompetitionEnding';
import GroupCompetitionEnded from './instances/GroupCompetitionEnded';

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

function eventDispatch(key, payload) {
  const event = events.find(e => e.key === key);

  if (event) {
    event.onDispatch(payload);
  }
}

export { eventDispatch };
