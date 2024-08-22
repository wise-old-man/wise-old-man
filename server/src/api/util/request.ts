import { Request } from 'express';
import { md5 } from 'js-md5';

export function getRequestIpHash(request: Request<unknown, unknown, unknown, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const plaintext = String(
    request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || request.ip
  );

  return md5(plaintext);
}
