import prisma, { Player } from '../../../../prisma';
import { Country, findCountry } from '../../../../utils';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import logger from '../../../util/logging';
import { standardize } from '../player.utils';

async function changePlayerCountry(username: string, country: string): Promise<Player> {
  const countryObject = country ? findCountry(country) : null;
  const countryCode = countryObject?.code;

  if (!countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  if (!(countryCode in Country)) {
    throw new ServerError(`Failed to validate country code: ${country}:${countryCode}`);
  }

  try {
    const updatedPlayer = await prisma.player.update({
      data: { country: countryCode },
      where: { username: standardize(username) }
    });

    logger.moderation(`[Player:${updatedPlayer.username}] Country updated to ${countryCode}`);

    return updatedPlayer;
  } catch (error) {
    // Failed to find player with that username or id
    throw new NotFoundError('Player not found.');
  }
}

export { changePlayerCountry };
