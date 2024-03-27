import { GroupDetails, MembershipWithPlayer } from './group.types';
import { PRIVELEGED_GROUP_ROLES } from '../../../utils';
import { GroupRoleOrder } from '@prisma/client';

function sanitizeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

function buildDefaultSocialLinks() {
  return {
    website: null,
    discord: null,
    twitter: null,
    youtube: null,
    twitch: null
  };
}

function sortMembers(
  memberships: MembershipWithPlayer[],
  roleOrders?: GroupRoleOrder[]
): MembershipWithPlayer[] {
  if (roleOrders && roleOrders.length) {
    const roleOrderMap = new Map(roleOrders.map(r => [r.role, r.index]));
    // this assumes roleOrders is sorted by index ascending out of the database
    return [...memberships].sort(
      (a, b) => (roleOrderMap.get(a.role) ?? 10000) - (roleOrderMap.get(b.role) ?? 10000)
    );
  }

  const priorities = [...PRIVELEGED_GROUP_ROLES].reverse();
  // fallback to priority if there is no roleOrders Records
  return [...memberships].sort(
    (a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role)
  );
}
export { sanitizeName, buildDefaultSocialLinks, sortMembers };
