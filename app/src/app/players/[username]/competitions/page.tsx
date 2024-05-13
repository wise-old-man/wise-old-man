import { CompetitionStatus, PlayerCompetitionsFilter } from "@wise-old-man/utils";
import { Label } from "~/components/Label";
import { CompetitionsList } from "~/components/competitions/CompetitionsList";
import {
  getCompetitionStatus,
  getPlayerCompetitionStandings,
  getPlayerCompetitions,
  getPlayerDetails,
} from "~/services/wiseoldman";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await getPlayerDetails(decodeURI(props.params.username));

  return {
    title: `Competitions: ${player.displayName}`,
  };
}

export default async function PlayerCompetitionsPage(props: PageProps) {
  const { params } = props;

  const username = decodeURI(params.username);

  const [player, competitions, finishedCompStandings, ongoingCompStandings] = await Promise.all([
    getPlayerDetails(username),
    getPlayerCompetitions(username),
    getPlayerCompetitionStandings(username, { status: CompetitionStatus.FINISHED }),
    getPlayerCompetitionStandings(username, { status: CompetitionStatus.ONGOING }),
  ]);

  if (!competitions || competitions.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-200">
        {player.displayName} has no competitions.
      </div>
    );
  }

  const upcoming = competitions
    .map((c) => c.competition)
    .filter((c) => getCompetitionStatus(c) === CompetitionStatus.UPCOMING);

  const ongoing = ongoingCompStandings.map((c) => ({
    ...c.competition,
    rank: c.rank,
  }));

  const finished = finishedCompStandings.map((c) => ({
    ...c.competition,
    rank: c.rank,
  }));

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
