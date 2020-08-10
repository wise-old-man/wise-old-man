import { PaginationConfig } from 'types';
import { BadRequestError } from 'api/errors';

// TODO: parse to int before checking < > 0
function getPaginationConfig(limit, offset): PaginationConfig {
  if (limit <= 0) {
    throw new BadRequestError('Invalid limit: must be > 0');
  }

  if (offset < 0) {
    throw new BadRequestError('Invalid offset: must a positive number.');
  }

  return { limit: parseInt(limit, 10) || 20, offset: parseInt(offset, 10) || 0 };
}

export { getPaginationConfig };
