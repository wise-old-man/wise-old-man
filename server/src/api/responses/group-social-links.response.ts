/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { GroupSocialLinks } from '../../types';
import { pick } from '../../utils/pick.util';

export type GroupSocialLinksResponse = Pick<
  GroupSocialLinks,
  'website' | 'discord' | 'twitter' | 'youtube' | 'twitch'
>;

export function formatGroupSocialLinksResponse(socialLinks: GroupSocialLinks): GroupSocialLinksResponse {
  return pick(socialLinks, 'website', 'discord', 'twitter', 'youtube', 'twitch');
}
