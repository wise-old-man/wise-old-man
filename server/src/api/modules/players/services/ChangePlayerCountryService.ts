import prisma from '../../../../prisma';
import { Country, Player } from '../../../../types';
import { findCountry } from '../../../../utils/shared';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import { standardize } from '../player.utils';

async function changePlayerCountry(username: string, country: string | null): Promise<Player> {
  const countryObject = country ? findCountry(country) : null;
  const countryCode = countryObject?.code;

  if (countryObject !== null && !countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  if (countryCode && !(countryCode in Country)) {
    throw new ServerError(`Failed to validate country code: ${country}:${countryCode}`);
  }

  try {
    const updatedPlayer = await prisma.player.update({
      data: { country: countryCode ? countryCode : null },
      where: { username: standardize(username) }
    });

    return updatedPlayer;
  } catch (_error) {
    // Failed to find player with that username or id
    throw new NotFoundError('Player not found.');
  }
}

export { changePlayerCountry };
