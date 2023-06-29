import { Fragment } from "react";
import { fetchPlayer, fetchPlayerNameChanges } from "~/services/wiseoldman";
import { timeago } from "~/utils/dates";

import ArrowRightIcon from "~/assets/arrow_right.svg";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await fetchPlayer(decodeURI(props.params.username));

  return {
    title: `Name Changes: ${player.displayName}`,
  };
}

export default async function PlayerNameChangesPage(props: PageProps) {
  const { params } = props;

  const username = decodeURI(params.username);

  const [player, nameChanges] = await Promise.all([
    fetchPlayer(username),
    fetchPlayerNameChanges(username),
  ]);

  if (!nameChanges || nameChanges.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-400">
        {player.displayName} has no known name changes.
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-h3 font-medium text-white">Name change history</h3>
        <p className="text-body text-gray-200">Previous usernames this account used to hold.</p>
      </div>
      <div className="mt-5">
        <div className="rounded-lg border border-gray-600 px-5 py-4 text-sm">
          {player.displayName}
          <span className="ml-2 text-xs text-gray-200">(current)</span>
        </div>
        {nameChanges.map((nameChange) => (
          <Fragment key={nameChange.id}>
            <div className="my-4 ml-4 flex items-center text-gray-200">
              <ArrowRightIcon className="h-5 w-5 -rotate-90" />
              <span className="ml-2 mt-px text-xs">
                {timeago.format(nameChange.resolvedAt || new Date())}
              </span>
            </div>
            <div className="rounded-lg border border-gray-600 px-5 py-4 text-sm">
              {nameChange.oldName}
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}
