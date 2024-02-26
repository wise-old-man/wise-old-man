import { z } from 'zod';
import { isValidDate } from './dates';
import { GroupRole } from '../../utils';

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
    if (issue.received === 'undefined') {
      return { message: `Parameter '${issue.path}' is undefined.` };
    }

    if (issue.expected === 'number') {
      return { message: `Parameter '${issue.path}' is not a valid number.` };
    }

    if (issue.expected === 'string') {
      return { message: `Parameter '${issue.path}' is not a valid string.` };
    }

    if (issue.expected === 'array') {
      return { message: `Parameter '${issue.path}' is not a valid array.` };
    }

    if (/^(?:'(\w+)'(?: \| )?)+$/.test(issue.expected)) {
      return enumErrorMap(issue.path, issue.expected.split(' | '));
    }
  }

  if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    return enumErrorMap(issue.path, issue.options);
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'array') {
      return { message: `Parameter '${issue.path}' must have a minimum of ${issue.minimum} element(s).` };
    }

    return { message: `Parameter '${issue.path}' must have a minimum of ${issue.minimum} character(s).` };
  }

  if (issue.code === z.ZodIssueCode.too_big) {
    return { message: `Parameter '${issue.path}' must have a maximum of ${issue.maximum} character(s).` };
  }

  if ('validation' in issue && issue.validation === 'url' && issue.code === z.ZodIssueCode.invalid_string) {
    return { message: `Parameter '${String(issue.path).replaceAll(',', '.')}' is not a valid URL.` };
  }

  return { message: ctx.defaultError };
});

export type PaginationOptions = {
  limit: number;
  offset: number;
};

export function getPaginationSchema(maxLimit = 50) {
  let limit = z.coerce.number().int().positive("Parameter 'limit' must be > 0.");

  if (maxLimit) {
    limit = limit.max(
      maxLimit,
      `The maximum results limit is ${maxLimit}. Please consider using the 'offset' parameter to load more data.`
    );
  }

  return z.object({
    limit: z.optional(limit).default(20) as unknown as z.ZodNumber,
    offset: z
      .optional(z.coerce.number().int().nonnegative("Parameter 'offset' must be >= 0."))
      .default(0) as unknown as z.ZodNumber
  });
}

const INVALID_TEAM_TYPE_ERROR = `Invalid teams list. Must be an array of { name: string; participants: string[]; }.`;

export const teamSchema = z.object(
  {
    name: z
      .string({
        required_error: INVALID_TEAM_TYPE_ERROR,
        invalid_type_error: INVALID_TEAM_TYPE_ERROR
      })
      .min(1, 'Team names must have at least one character.')
      .max(30, 'Team names cannot be longer than 30 characters.'),
    participants: z
      .array(z.string(), {
        invalid_type_error: INVALID_TEAM_TYPE_ERROR,
        required_error: INVALID_TEAM_TYPE_ERROR
      })
      .nonempty({ message: 'All teams must have a valid non-empty participants array.' })
  },
  {
    invalid_type_error: INVALID_TEAM_TYPE_ERROR
  }
);

const groupRoleSchema = z.nativeEnum(GroupRole);

export const memberSchema = z.object(
  {
    username: z.string(),
    role: z.optional(groupRoleSchema).default(GroupRole.MEMBER) as unknown as typeof groupRoleSchema
  },
  {
    invalid_type_error: 'Invalid members list. Must be an array of { username: string; role?: string; }.'
  }
);

const urlSchema = z.preprocess(
  str => (str === '' ? null : str),
  z.string().url().or(z.null())
) as unknown as z.ZodUnion<[z.ZodString, z.ZodNull]>;

export const socialLinksSchema = z.object({
  website: z.optional(urlSchema),
  discord: z.optional(urlSchema),
  twitter: z.optional(urlSchema),
  twitch: z.optional(urlSchema),
  youtube: z.optional(urlSchema)
});

export function getDateSchema(propName: string) {
  return z
    .any()
    .refine(s => typeof s === 'string' && isValidDate(s), {
      message: `Parameter '${propName}' is not a valid date.`
    })
    .pipe(z.coerce.date()) as unknown as z.ZodDate;
}
