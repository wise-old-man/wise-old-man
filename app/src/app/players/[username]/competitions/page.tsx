import { CompetitionStatus } from "@wise-old-man/utils";
import { Label } from "~/components/Label";
import { CompetitionsList } from "~/components/competitions/CompetitionsList";
import { getCompetitionStatus, getPlayerCompetitions, getPlayerDetails } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const player = await getPlayerDetails(decodeURI((await props.params).username));

  return {
    title: `Competitions: ${player.displayName}`,
  };
}

export default async function PlayerCompetitionsPage(props: PageProps) {
  const params = await props.params;

  const username = decodeURI(params.username);

  const [player, competitions] = await Promise.all([
    getPlayerDetails(username),
    getPlayerCompetitions(username),
  ]);

  if (!competitions || competitions.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-200">
        {player.displayName} has no competitions.
      </div>
    );
  }

  const mappedCompetitions = competitions.map((c) => c.competition);

  const ongoing = mappedCompetitions.filter(
    (c) => getCompetitionStatus(c) === CompetitionStatus.ONGOING
  );
  const upcoming = mappedCompetitions.filter(
    (c) => getCompetitionStatus(c) === CompetitionStatus.UPCOMING
  );
  const finished = mappedCompetitions.filter(
    (c) => getCompetitionStatus(c) === CompetitionStatus.FINISHED
  );

  return (
    <div className="-mt-2 flex flex-col gap-y-7">
      {ongoing.length + upcoming.length > 0 && ongoing.length + upcoming.length < 2 ? (
        <div>
          <Label className="text-xs text-gray-200">Featured competitions</Label>
          <CompetitionsList data={[...ongoing, ...upcoming]} showHost />
        </div>
      ) : (
        <>
          {ongoing.length > 0 && (
            <div>
              <Label className="text-xs text-gray-200">Ongoing competitions</Label>
              <CompetitionsList data={ongoing} showHost />
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <Label className="text-xs text-gray-200">Upcoming competitions</Label>
              <CompetitionsList data={upcoming} showHost />
            </div>
          )}
        </>
      )}
      {finished.length > 0 && (
        <div>
          <Label className="text-xs text-gray-200">Past competitions</Label>
          <CompetitionsList data={finished} showHost />
        </div>
      )}
    </div>
  );
}
