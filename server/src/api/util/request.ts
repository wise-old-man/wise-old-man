import { Request } from 'express';
import { md5 } from 'js-md5';

export function getRequestIp(request: Request<unknown, unknown, unknown, unknown>) {
  return String(request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || request.ip);
}

export function getRequestIpHash(request: Request<unknown, unknown, unknown, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return md5(getRequestIp(request));
}
