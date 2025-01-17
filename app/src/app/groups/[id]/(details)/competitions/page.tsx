import { CompetitionStatus } from "@wise-old-man/utils";
import { Label } from "~/components/Label";
import { CompetitionsList } from "~/components/competitions/CompetitionsList";
import { getCompetitionStatus, getGroupCompetitions, getGroupDetails } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: number;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const { id } = (await props.params);

  const group = await getGroupDetails(id);

  return {
    title: `Competitions: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupCompetitionsPage(props: PageProps) {
  const { id } = (await props.params);

  const [group, competitions] = await Promise.all([getGroupDetails(id), getGroupCompetitions(id)]);

  if (!competitions || competitions.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-200">
        {group.name} has no competitions.
      </div>
    );
  }

  const ongoing = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.ONGOING);
  const upcoming = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.UPCOMING);
  const finished = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.FINISHED);

  return (
    <div className="-mt-2 flex flex-col gap-y-7">
      {ongoing.length + upcoming.length > 0 && ongoing.length + upcoming.length < 2 ? (
        <div>
          <Label className="text-xs text-gray-200">Featured competitions</Label>
          <CompetitionsList data={[...ongoing, ...upcoming]} />
        </div>
      ) : (
        <>
          {ongoing.length > 0 && (
            <div>
              <Label className="text-xs text-gray-200">Ongoing competitions</Label>
              <CompetitionsList data={ongoing} />
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <Label className="text-xs text-gray-200">Upcoming competitions</Label>
              <CompetitionsList data={upcoming} />
            </div>
          )}
        </>
      )}
      {finished.length > 0 && (
        <div>
          <Label className="text-xs text-gray-200">Past competitions</Label>
          <CompetitionsList data={finished} />
        </div>
      )}
    </div>
  );
}
