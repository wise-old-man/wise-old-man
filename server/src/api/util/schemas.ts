import { z } from 'zod';
import { isValidDate } from './dates';

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

export function getDateSchema(propName: string) {
  return z
    .any()
    .refine(s => typeof s === 'string' && isValidDate(s), {
      message: `Parameter '${propName}' is not a valid date.`
    })
    .pipe(z.coerce.date()) as unknown as z.ZodDate;
}
