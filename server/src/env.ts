/**
 * This file has been created as a way to force any usage
 * of process.env to go through a dotenv.config first.
 */
import dotenv from 'dotenv';
dotenv.config({ path: getConfigPath() });

function getConfigPath() {
  return isTesting() ? '.env.test' : '.env';
}

export function isTesting() {
  return process.env.NODE_ENV === 'test';
}

export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

export function isRunningInMainCPUCore() {
  return process.env.pm_id && parseInt(process.env.pm_id, 10) === 0;
}

export default process.env;
