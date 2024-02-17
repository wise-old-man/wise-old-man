/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { isValidDate } from './dates';

function enumErrorMap(path: Array<string | number>, options: Array<string | number>) {
  if (path.length === 1 && path[0] === 'country') {
    return {
      message: `Invalid enum value for 'country'. You must either supply a valid country code, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    };
  }

  if (options.length < 5) {
    return { message: `Invalid enum value for '${path}'. Expected ${options.join(' | ')}` };
  }

  return { message: `Invalid enum value for '${path[path.length - 1]}'.` };
}

// Add a global error map to zod validations
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'number') {
      return { message: `Parameter '${issue.path}' is not a valid number.` };
    } else if (issue.expected === 'string') {
      return { message: `Parameter '${issue.path}' is undefined.` };
    } else if (/^(?:'(\w+)'(?: \| )?)+$/.test(issue.expected)) {
      return enumErrorMap(issue.path, issue.expected.split(' | '));
    }
  } else if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    return enumErrorMap(issue.path, issue.options);
  }

  return { message: ctx.defaultError };
});

export function getPaginationSchema(maxLimit = 50) {
  let limit = z.coerce.number().int().positive("Parameter 'limit' must be > 0.");

  if (maxLimit) {
    limit = limit.max(
      maxLimit,
      `The maximum results limit is ${maxLimit}. Please consider using the 'offset' parameter to load more data.`
    );
  }

  return z.object({
    limit: z.optional(limit).default(20),
    offset: z.optional(z.coerce.number().int().nonnegative("Parameter 'offset' must be >= 0.")).default(0)
  });
}

export type PaginationOptions = {
  limit?: number;
  offset?: number;
};

export function getNumber(payload: any): number | undefined {
  if (payload === undefined || payload === null || isNaN(payload) || String(payload).length === 0) {
    return undefined;
  }

  return Number(payload);
}

export function getString(payload: any): string | undefined {
  if (payload === undefined || payload === null) return undefined;
  return String(payload);
}

export function getEnum(payload: any): any | undefined {
  return getString(payload) as any;
}

export function getDate(payload: any): Date | undefined {
  try {
    const dateString = z.string().refine(isValidDate).parse(payload);
    return new Date(dateString);
  } catch (error) {
    return undefined;
  }
}
