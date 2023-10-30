import { MemberActivityWithPlayer } from "@wise-old-man/utils";
import { getGroupActivity, getGroupDetails } from "~/services/wiseoldman";
import { QueryLink } from "~/components/QueryLink";
import { GroupWidgets } from "~/components/groups/GroupWidgets";
import { MembersTable } from "~/components/groups/MembersTable";
import { GroupActivityItem } from "~/components/groups/GroupActivityItem";
import { GroupActivityDialog } from "~/components/groups/GroupActivityDialog";

export const dynamic = "force-dynamic";

const ACTIVITY_ITEMS_COUNT = 10;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    filter: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: group.name,
    description: group.description,
  };
}

export default async function GroupDetailsPage(props: PageProps) {
  const { id } = props.params;
  const { filter } = props.searchParams;

  const [groupDetails, groupActivity] = await Promise.all([
    getGroupDetails(id),
    getGroupActivity(id, ACTIVITY_ITEMS_COUNT),
  ]);

  return (
    <div className="flex flex-col gap-y-10">
      <GroupWidgets group={groupDetails} />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          <MembersTable group={groupDetails} filter={filter} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <GroupActivityList groupId={id} groupActivity={groupActivity} />
        </div>
      </div>
    </div>
  );
}

interface GroupActivityListProps {
  groupId: number;
  groupActivity: MemberActivityWithPlayer[];
}

function GroupActivityList(props: GroupActivityListProps) {
  const { groupId, groupActivity } = props;

  return (
    <>
      <div className="rounded-lg border border-gray-500 bg-gray-800 shadow-sm">
        <h3 className="border-b border-gray-600 p-4 text-h3">Recent activity</h3>
        <ul className="flex flex-col divide-y divide-gray-600">
          {groupActivity.length === 0 ? (
            <li className="px-4 py-4 text-center text-xs leading-5 text-gray-200">
              <p>There is no recent activity for this group.</p>
              <p>(Since October 18th 2023)</p>
            </li>
          ) : (
            <>
              {groupActivity.map((activity) => (
                <li key={`${activity.createdAt.toISOString()}_${activity.playerId}`}>
                  <GroupActivityItem activity={activity} />
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
      {groupActivity.length === ACTIVITY_ITEMS_COUNT && (
        <>
          <div className="mt-3 flex justify-end">
            <QueryLink
              className="text-xs font-medium text-gray-200 hover:underline"
              query={{ dialog: "group-activity" }}
              scroll={false}
            >
              View more
            </QueryLink>
          </div>
          <GroupActivityDialog groupId={groupId} initialData={groupActivity} />
        </>
      )}
    </>
  );
}
