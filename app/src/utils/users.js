// Groups
export const mapGroupMembers = members =>
  members.map(({ username, displayName, role }) => ({ username, displayName, role }));

export const getRemovedGroupMembers = (initialMembers, currentMembers) =>
  initialMembers.filter(
    initial => currentMembers.find(current => current.username === initial.username) === undefined
  );

// Competitions
export const mapParticipants = participants => participants.map(({ displayName }) => displayName);

export const getRemovedParticipants = (initialParticipants, currentParticipants) =>
  initialParticipants.filter(
    initial => currentParticipants.find(current => current === initial) === undefined
  );
