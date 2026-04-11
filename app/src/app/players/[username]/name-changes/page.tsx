import { Fragment } from "react";
import { timeago } from "~/utils/dates";
import { LocalDate } from "~/components/LocalDate";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/Accordion";
import { getPlayerArchives, getPlayerDetails, getPlayerNames } from "~/services/wiseoldman";

import ArrowRightIcon from "~/assets/arrow_right.svg";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await getPlayerDetails(decodeURI(props.params.username));

  return {
    title: `Name Changes: ${player.displayName}`,
  };
}

export default async function PlayerNameChangesPage(props: PageProps) {
  const { params } = props;

  const username = decodeURI(params.username);

  const [player, nameChanges, archives] = await Promise.all([
    getPlayerDetails(username),
    getPlayerNames(username),
    getPlayerArchives(username),
  ]);

  return (
    <>
      <div className="mb-4 mt-5">
        <h3 className="text-h3 font-medium text-white">Name change history</h3>
        <p className="text-body text-gray-200">Previous usernames this account used to hold.</p>
      </div>
      {!nameChanges || nameChanges.length === 0 ? (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-200">
          {player.displayName} has no known name changes.
        </div>
      ) : (
        <div>
          <div className="rounded-lg border border-gray-500 bg-gray-800 px-5 py-4 text-sm shadow-sm">
            {player.displayName}
            <span className="ml-2 text-xs text-gray-200">(current)</span>
          </div>
          {nameChanges.map((nameChange) => (
            <Fragment key={nameChange.id}>
              <div className="my-4 ml-4 flex items-center text-gray-200">
                <ArrowRightIcon className="h-5 w-5 -rotate-90" />
                <span className="ml-2 mt-px text-xs">
                  <LocalDate isoDate={(nameChange.resolvedAt || new Date()).toISOString()} />
                </span>
              </div>
              <div className="rounded-lg border border-gray-500 bg-gray-800 px-5 py-4 text-sm">
                {nameChange.oldName}
              </div>
            </Fragment>
          ))}
        </div>
      )}
      {archives && archives.length > 0 && (
        <Accordion className="mt-5" type="single" collapsible>
          <AccordionItem value="faq" className="border-0">
            <AccordionTrigger className="rounded-md border border-gray-500 p-3 text-center text-sm text-gray-200 data-[state=open]:rounded-b-none">
              {`There are ${archives.length} archived profile(s) that once held the "${username}" username.
                Click to show all.`}
            </AccordionTrigger>
            <AccordionContent className="border border-t-0 border-gray-500 px-5 pb-0 pt-3 text-gray-200">
              <ListTable className="border-spacing-y-3">
                {archives.map((archive) => (
                  <ListTableRow key={archive.archiveUsername}>
                    <ListTableCell>
                      <PlayerIdentity
                        player={archive.player}
                        caption={`Archived ${timeago.format(archive.createdAt)}`}
                      />
                    </ListTableCell>
                  </ListTableRow>
                ))}
              </ListTable>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
}
