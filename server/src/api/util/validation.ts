import { z } from 'zod';

// Add a global error map to zod validations
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'number') {
      return { message: `Parameter '${issue.path}' is not a valid number.` };
    } else if (issue.expected === 'string') {
      return { message: `Parameter '${issue.path}' is undefined.` };
    }
  } else if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    if (issue.options.length < 5) {
      return { message: `Invalid enum value for '${issue.path}'. Expected ${issue.options.join(' | ')}` };
    }

    return { message: `Invalid enum value for '${issue.path}'.` };
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
    return z.date().parse(payload);
  } catch (error) {
    return undefined;
  }
}
