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

export default process.env;
