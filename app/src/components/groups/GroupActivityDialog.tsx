"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Dialog";
import { MemberActivityWithPlayer } from "@wise-old-man/utils";
import { GroupActivityItem } from "./GroupActivityItem";
import { useInView } from "react-intersection-observer";

const RESULTS_PER_PAGE = 20;

function useInfiniteLoad(
  groupId: number,
  initialData: MemberActivityWithPlayer[],
  options: { enabled?: boolean }
) {
  const client = useWOMClient();

  const query = useInfiniteQuery({
    queryKey: ["groupActivity", groupId],
    queryFn: ({ pageParam }) => {
      return client.groups.getGroupActivity(groupId, {
        limit: RESULTS_PER_PAGE,
        offset: initialData.length + (pageParam ?? 0) * RESULTS_PER_PAGE,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 0 ? undefined : pages.length;
    },
    enabled: options.enabled === undefined || options.enabled,
  });

  const flatData = query.data?.pages.flat() ?? [];
  return { ...query, data: flatData };
}

interface GroupActivityDialogProps {
  groupId: number;
  initialData: MemberActivityWithPlayer[];
}

export function GroupActivityDialog(props: GroupActivityDialogProps) {
  const { groupId, initialData } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "group-activity";

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteLoad(groupId, initialData, {
    enabled: isOpen,
  });

  // Whenever this element is in the viewport, fetch the next page (if there is one)
  const { ref: triggerElementRef } = useInView({
    delay: 200,
    onChange: (inView) => {
      if (inView && hasNextPage) fetchNextPage();
    },
  });

  const activity = [...initialData, ...(data ? data : [])];

  function handleClose() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("dialog");

    router.replace(`${pathname}?${nextParams.toString()}`);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <DialogContent className="gap-y-0 px-0 pb-0">
        <DialogHeader>
          <DialogTitle className="border-b border-gray-600 px-5 pb-6">Recent activity</DialogTitle>
        </DialogHeader>
        <ul className="custom-scroll flex max-h-[70vh] flex-col divide-y divide-gray-600 overflow-y-auto">
          {activity.map((activity) => (
            <li key={`${activity.createdAt.toISOString()}_${activity.playerId}`}>
              <GroupActivityItem activity={activity} />
            </li>
          ))}
          {hasNextPage ? (
            <li className="py-4 text-center text-sm text-gray-200" ref={triggerElementRef}>
              Loading...
            </li>
          ) : (
            <>
              {!isLoading && (
                <li className="py-4 text-center text-xs text-gray-200">
                  <p>No more recent activity.</p>
                  <p>(This feature was introduced on October 18th 2023)</p>
                </li>
              )}
            </>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
