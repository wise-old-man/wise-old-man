/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { GroupRoleOrder } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "GroupRoleOrder"
export type GroupRoleOrderResponse = GroupRoleOrder;

export function formatGroupRoleOrderResponse(groupRoleOrder: GroupRoleOrder): GroupRoleOrderResponse {
  return pick(groupRoleOrder, 'groupId', 'role', 'index');
}
