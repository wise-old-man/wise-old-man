import { findCountry } from '@wise-old-man/utils';
import { z } from 'zod';
import prisma, { Country, modifyPlayer, Player } from '../../../../prisma';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import { standardize } from '../player.utils';

const ERROR_MESSAGE = "Parameter 'country' is undefined.";

const inputSchema = z
  .object({
    id: z.number().positive().optional(),
    username: z.string().optional(),
    // This service accepts country codes, and country names (will attempt to parse these into country codes)
    country: z.string({ required_error: ERROR_MESSAGE }).nonempty({ message: ERROR_MESSAGE })
  })
  .refine(s => s.id || s.username, {
    message: 'Undefined id and username.'
  });

type ChangePlayerCountryParams = z.infer<typeof inputSchema>;

async function changePlayerCountry(payload: ChangePlayerCountryParams): Promise<Player> {
  const params = inputSchema.parse(payload);

  const countryObject = params.country ? findCountry(params.country) : null;
  const countryCode = countryObject?.code;

  if (!countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  if (!(countryCode in Country)) {
    throw new ServerError(`Failed to validate country code: ${params.country}:${countryCode}`);
  }

  try {
    const updatedPlayer = await prisma.player
      .update({
        data: { country: countryCode as Country },
        where: { id: params.id, username: standardize(params.username) }
      })
      .then(modifyPlayer);

    return updatedPlayer;
  } catch (error) {
    // Failed to find player with that username or id
    throw new NotFoundError('Player not found.');
  }
}

export { changePlayerCountry };
