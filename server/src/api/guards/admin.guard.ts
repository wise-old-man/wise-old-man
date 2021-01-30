import env from '../../env';

function checkAdminPermissions(adminPassword: string) {
  return adminPassword === env.ADMIN_PASSWORD;
}

export { checkAdminPermissions };
