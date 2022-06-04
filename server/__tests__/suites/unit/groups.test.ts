import { GroupRole, GROUP_ROLES, GroupRoleProps, findGroupRole } from '../../../src/utils';

describe('Util - Groups', () => {
  test('Props', () => {
    expect(GROUP_ROLES.some(t => !(t in GroupRoleProps))).toBe(false);
    expect(Object.keys(GroupRole).length).toBe(Object.keys(GroupRoleProps).length);
  });

  test('findGroupRole', () => {
    expect(findGroupRole('artisan')).toBe(GroupRole.ARTISAN);
    expect(findGroupRole('SCOUT')).toBe(GroupRole.SCOUT);
    expect(findGroupRole('Other')).toBe(null);
  });
});
