import { complete, errored, isComplete, Result } from '@attio/fetchable';
import prisma from '../../../prisma';
import { PlayerBuild, Snapshot } from '../../../types';
import * as snapshotUtils from '../snapshots/snapshot.utils';

/**
 * Format a username into a standardized version,
 * replacing any special characters, and forcing lower case.
 *
 * "Psikoi" -> "psikoi",
 * "Hello_world  " -> "hello world"
 */
function standardize(username: string): string {
  return sanitize(username).toLowerCase();
}

function sanitize(username: string): string {
  return username.replace(/[-_\s]/g, ' ').trim();
}

export type PlayerUsernameValidationError =
  | { code: 'USERNAME_IS_UNDEFINED' }
  | { code: 'USERNAME_TOO_SHORT' }
  | { code: 'USERNAME_TOO_LONG' }
  | { code: 'USERNAME_STARTS_OR_ENDS_WITH_SPACE' }
  | { code: 'USERNAME_HAS_SPECIAL_CHARACTERS' };

export function validateUsername(username: string): Result<null, PlayerUsernameValidationError> {
  const standardized = standardize(username);

  if (!standardized) {
    return errored({ code: 'USERNAME_IS_UNDEFINED' });
  }

  if (standardized.length < 1) {
    return errored({ code: 'USERNAME_TOO_SHORT' });
  }

  if (standardized.length > 12) {
    return errored({ code: 'USERNAME_TOO_LONG' });
  }

  if (standardized.startsWith(' ') || standardized.endsWith(' ')) {
    return errored({ code: 'USERNAME_STARTS_OR_ENDS_WITH_SPACE' });
  }

  // If has any special characters
  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(standardized)) {
    return errored({ code: 'USERNAME_HAS_SPECIAL_CHARACTERS' });
  }

  return complete(null);
}

function isValidUsername(username: string): boolean {
  return isComplete(validateUsername(username));
}

function getBuild(snapshot: Snapshot, isFakeF2p: boolean): PlayerBuild {
  if (!isFakeF2p && snapshotUtils.isF2p(snapshot)) {
    return snapshotUtils.isLvl3(snapshot) ? PlayerBuild.F2P_LVL3 : PlayerBuild.F2P;
  }

  if (snapshotUtils.isLvl3(snapshot)) return PlayerBuild.LVL3;
  // This must be above 1def because 10 HP accounts can also have 1 def
  if (snapshotUtils.is10HP(snapshot)) return PlayerBuild.HP10;
  if (snapshotUtils.is1Def(snapshot)) return PlayerBuild.DEF1;
  if (snapshotUtils.isZerker(snapshot)) return PlayerBuild.ZERKER;

  return PlayerBuild.MAIN;
}

async function splitArchivalData(playerId: number, lastSnapshotDate: Date) {
  const memberships = await prisma.membership.findMany({
    where: { playerId }
  });

  const participations = await prisma.participation.findMany({
    where: { playerId },
    include: { competition: true }
  });

  const newPlayerGroupIds = new Set<number>();
  const newPlayerCompetitionIds = new Set<number>();

  const archivedPlayerGroupIds = new Set<number>();
  const archivedPlayerCompetitionIds = new Set<number>();

  if (memberships.length === 0 && participations.length === 0) {
    return {
      newPlayerGroupIds,
      newPlayerCompetitionIds,
      archivedPlayerGroupIds,
      archivedPlayerCompetitionIds
    };
  }

  memberships.forEach(m => {
    if (m.createdAt.getTime() <= lastSnapshotDate.getTime()) {
      // if this membership was created before the cutoff date, it belongs to the archived player
      archivedPlayerGroupIds.add(m.groupId);
    } else {
      // if it was created sometime after the cutoff date, then it probably belongs to the new player
      newPlayerGroupIds.add(m.groupId);
    }
  });

  participations.forEach(p => {
    if (p.competition.groupId && archivedPlayerGroupIds.has(p.competition.groupId)) {
      // Any competitions hosted by "before" groups should be considered "before" competitions
      archivedPlayerCompetitionIds.add(p.competitionId);
      return;
    }

    if (p.createdAt.getTime() <= lastSnapshotDate.getTime()) {
      // if this participation was created before the cutoff date, it belongs to the archived player
      archivedPlayerCompetitionIds.add(p.competitionId);
    } else {
      // if the competition has ended and is missing a start or end snapshot, then that player has no real progress
      // in this competition, and therefor it isn't important enough to keep them from being archived
      if (
        p.competition.endsAt.getTime() < Date.now() &&
        (p.startSnapshotId === -1 || p.endSnapshotId === -1)
      ) {
        return;
      }

      // if it was created sometime after the cutoff date, then it probably belongs to the new player
      newPlayerCompetitionIds.add(p.competitionId);
    }
  });

  return {
    newPlayerGroupIds,
    newPlayerCompetitionIds,
    archivedPlayerGroupIds,
    archivedPlayerCompetitionIds
  };
}

export { getBuild, isValidUsername, sanitize, splitArchivalData, standardize };
