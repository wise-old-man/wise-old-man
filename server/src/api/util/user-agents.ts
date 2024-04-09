import { Details as UserAgentDetails } from 'express-useragent';

// Group user agents that include this keyword
const EXPECTED_SEGMENTS = ['Google-Apps-Script', 'GoogleDocs'];

export function parseUserAgent(userAgent: string | undefined, details: UserAgentDetails | undefined) {
  if (!userAgent) {
    return details?.browser ?? 'none';
  }

  for (const segment of EXPECTED_SEGMENTS) {
    if (userAgent.includes(segment)) {
      return segment;
    }
  }

  return userAgent;
}
