import { GroupListItem } from "@wise-old-man/utils";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

import VerifiedIcon from "~/assets/verified.svg";

export function GroupCard(props: GroupListItem) {
  return (
    <Link href={`/groups/${props.id}`} className="group">
      <div className="flex h-[8.75rem] flex-col justify-between rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-md group-hover:border-gray-500 group-hover:bg-gray-700">
        <div>
          <div className="flex items-center">
            <h3 className="mr-2 text-base font-bold leading-5">{props.name}</h3>
            {props.verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <VerifiedIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>This group is verified on our Discord server.</TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className="text-xs text-gray-200">
            {props.memberCount} {props.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-5 text-gray-200">{props.description}</p>
      </div>
    </Link>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="h-[8.75rem] rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-md">
      <div className="h-4 w-40 animate-pulse rounded-lg bg-gray-500" />
      <div className="mt-2.5 h-3 w-24 animate-pulse rounded-lg bg-gray-500" />
      <div className="mt-7 h-3 w-full animate-pulse rounded-lg bg-gray-500" />
      <div className="mt-2 h-3 w-full animate-pulse rounded-lg bg-gray-500" />
    </div>
  );
}
