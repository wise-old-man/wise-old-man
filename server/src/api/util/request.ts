import { Request } from 'express';
import { hashString } from '../services/external/crypt.service';

export async function getRequestIpHash(request: Request<unknown, unknown, unknown, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const plaintext = String(
    request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || request.ip
  );

  return await hashString(plaintext);
}
