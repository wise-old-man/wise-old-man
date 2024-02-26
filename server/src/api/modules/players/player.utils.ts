import { Period, PeriodProps, PlayerBuild, PlayerDetails } from '../../../utils';
import prisma, { Player, PlayerArchive, Snapshot } from '../../../prisma';
import * as snapshotUtils from '../snapshots/snapshot.utils';
import { getPlayerEfficiencyMap } from '../efficiency/efficiency.utils';
import { formatSnapshot } from '../snapshots/snapshot.utils';

const YEAR_IN_SECONDS = PeriodProps[Period.YEAR].milliseconds / 1000;
const DECADE_IN_SECONDS = YEAR_IN_SECONDS * 10;

function formatPlayerDetails(
  player: Player,
  snapshot: Snapshot | null,
  archive?: PlayerArchive | null
): PlayerDetails {
  return {
    ...player,
    combatLevel: snapshot ? snapshotUtils.getCombatLevelFromSnapshot(snapshot) : 3,
    archive: archive ? archive : null,
    latestSnapshot: snapshot ? formatSnapshot(snapshot, getPlayerEfficiencyMap(snapshot, player)) : null
  };
}

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

function validateUsername(username: string): Error | null {
  const standardized = standardize(username);

  if (!standardized) {
    return new Error('Username must be defined.');
  }

  // If doesn't meet the size requirements
  if (standardized.length < 1 || standardized.length > 12) {
    return new Error('Username must be between 1 and 12 characters long.');
  }

  // If starts or ends with a space
  if (standardized.startsWith(' ') || standardized.endsWith(' ')) {
    return new Error('Username cannot start or end with spaces.');
  }

  // If has any special characters
  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(standardized)) {
    return new Error('Username cannot contain any special characters.');
  }

  return null;
}

function isValidUsername(username: string): boolean {
  return validateUsername(username) === null;
}

/**
 * Checks if a given player has been imported from CML in the last 24 hours.
 */
function shouldImport(lastImportedAt: Date | null): [boolean, number] {
  // If the player's CML history has never been
  // imported, should import the last years
  if (!lastImportedAt) return [true, DECADE_IN_SECONDS];

  const seconds = Math.floor((Date.now() - lastImportedAt.getTime()) / 1000);

  return [seconds / 60 / 60 >= 24, seconds];
}

function getBuild(snapshot: Snapshot): PlayerBuild {
  if (snapshotUtils.isF2p(snapshot)) {
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

export {
  formatPlayerDetails,
  standardize,
  sanitize,
  validateUsername,
  isValidUsername,
  shouldImport,
  getBuild,
  splitArchivalData
};
