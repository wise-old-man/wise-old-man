/**
 * This file has been created as a way to force any usage
 * of process.env to go through a dotenv.config first.
 */
import dotenv from 'dotenv';
dotenv.config();

export function isTesting() {
  return process.env.NODE_ENV === 'test';
}

export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

export function getThreadIndex() {
  if (process.env.pm_id === undefined) {
    return null;
  }

  return parseInt(process.env.pm_id, 10);
}

function parseTemplate(originTemplate: string) {
  if (!originTemplate) return originTemplate;
  return originTemplate.replace(/{([^{}]+)}/g, (_, key) => process.env[key]).replace(/\$/g, '');
}

process.env.DATABASE_URL = parseTemplate(process.env.DATABASE_URL);

export default process.env;
