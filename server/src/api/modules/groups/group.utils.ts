import { GroupRoleOrder, Membership } from '../../../types';
import { PRIVILEGED_GROUP_ROLES } from '../../../utils/shared';

function sortMembers<M extends { membership: Membership }>(
  memberships: Array<M>,
  roleOrders?: Array<GroupRoleOrder>
): Array<M> {
  if (roleOrders && roleOrders.length) {
    const roleOrderMap = new Map(roleOrders.map(r => [r.role, r.index]));
    // this assumes roleOrders is sorted by index ascending out of the database
    return [...memberships].sort(
      (a, b) =>
        (roleOrderMap.get(a.membership.role) ?? 10000) - (roleOrderMap.get(b.membership.role) ?? 10000)
    );
  }

  const priorities = [...PRIVILEGED_GROUP_ROLES].reverse();

  // fallback to priority if there is no roleOrders Records
  return [...memberships].sort(
    (a, b) =>
      priorities.indexOf(b.membership.role) - priorities.indexOf(a.membership.role) ||
      a.membership.role.localeCompare(b.membership.role)
  );
}
export { sortMembers };
