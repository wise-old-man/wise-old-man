"use client";

import { Period } from "@wise-old-man/utils";
import { usePathname } from "next/navigation";
import { LeaderboardSkeleton } from "./components/LeaderboardSkeleton";

export default function Loading() {
  const pathname = usePathname();
  const isRecordsLoading = pathname.includes("records");

  return (
    <>
      <LeaderboardSkeleton period={Period.DAY} hasCaption={isRecordsLoading} />
      <LeaderboardSkeleton period={Period.WEEK} hasCaption={isRecordsLoading} />
      <LeaderboardSkeleton period={Period.MONTH} hasCaption={isRecordsLoading} />
    </>
  );
}
