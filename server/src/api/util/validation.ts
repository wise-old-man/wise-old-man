import { z } from 'zod';
import { isValidDate } from './dates';

// Add a global error map to zod validations
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'number') {
      return { message: `Parameter '${issue.path}' is not a valid number.` };
    } else if (issue.expected === 'string') {
      return { message: `Parameter '${issue.path}' is undefined.` };
    }
  } else if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    if (issue.path.length === 1 && issue.path[0] === 'country') {
      return {
        message: `Invalid enum value for 'country'. You must either supply a valid country code, according to the ISO 3166-1 standard. \
        Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
      };
    }

    if (issue.options.length < 5) {
      return { message: `Invalid enum value for '${issue.path}'. Expected ${issue.options.join(' | ')}` };
    }

    return { message: `Invalid enum value for '${issue.path[issue.path.length - 1]}'.` };
  }

  return { message: ctx.defaultError };
});

export const PAGINATION_SCHEMA = z.object({
  limit: z
    .number()
    .int()
    .positive("Parameter 'limit' must be > 0.")
    .max(
      50,
      "The maximum results limit is 50. Please consider using the 'offset' parameter to load more data."
    )
    .optional()
    .default(20),
  offset: z.number().int().nonnegative("Parameter 'offset' must be >= 0.").optional().default(0)
});

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
