import { GroupDetails, MembershipWithPlayer } from './group.types';
import { PRIVELEGED_GROUP_ROLES } from '../../../utils';

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

function sortMembers(group: Omit<GroupDetails, 'socialLinks' | 'memberCount'>): MembershipWithPlayer[] {
  if (group.roleOrders && group.roleOrders.length) {
    // this assumes roleOrders is sorted by index ascending out of the database
    return [...group.memberships].sort(
      (a, b) =>
        (group.roleOrders?.find(order => order.role === a.role)?.index ?? 0) -
        (group.roleOrders?.find(order => order.role === b.role)?.index ?? 0)
    );
  } else {
    const priorities = [...PRIVELEGED_GROUP_ROLES].reverse();
    // fallback to priority if there is no roleOrders Records
    return [...group.memberships].sort(
      (a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role)
    );
  }
}
export { sanitizeName, buildDefaultSocialLinks, sortMembers };
