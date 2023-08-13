import { CompetitionStatus } from "@wise-old-man/utils";
import { Label } from "~/components/Label";
import { CompetitionsList } from "~/components/competitions/CompetitionsList";
import { apiClient, getCompetitionStatus } from "~/services/wiseoldman";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await apiClient.groups.getGroupDetails(id);

  return {
    title: `Competitions: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupCompetitionsPage(props: PageProps) {
  const { id } = props.params;

  const [group, competitions] = await Promise.all([
    apiClient.groups.getGroupDetails(id),
    apiClient.groups.getGroupCompetitions(id),
  ]);

  if (!competitions || competitions.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-400">
        {group.name} has no competitions.
      </div>
    );
  }

  const ongoing = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.ONGOING);
  const upcoming = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.UPCOMING);
  const finished = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.FINISHED);

  return (
    <div className="flex flex-col gap-y-7">
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
