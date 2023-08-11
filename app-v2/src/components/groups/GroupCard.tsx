import Link from "next/link";
import { GroupListItem } from "@wise-old-man/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

import VerifiedIcon from "~/assets/verified.svg";

export function GroupCard(props: GroupListItem) {
  return (
    <Link href={`/groups/${props.id}`} className="group">
      <div className="h-full rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-md group-hover:border-gray-500 group-hover:bg-gray-700">
        <div className="flex items-center">
          <h3 className="mr-2 text-base font-bold leading-5">{props.name}</h3>
          {props.verified && (
            <Tooltip>
              <TooltipTrigger>
                <VerifiedIcon />
              </TooltipTrigger>
              <TooltipContent>This group is verified on our Discord server.</TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-xs text-gray-200">
          {props.memberCount} {props.memberCount === 1 ? "member" : "members"}
        </span>
        <p className="mt-4 line-clamp-2 text-sm leading-5 text-gray-200">{props.description}</p>
      </div>
    </Link>
  );
}
