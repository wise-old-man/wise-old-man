"use client";

import { PropsWithChildren } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "~/utils/styling";
import { Button } from "../Button";
import { QueryLink } from "../QueryLink";
import { Dialog, DialogContent } from "../Dialog";

import ExpandIcon from "~/assets/expand.svg";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../Dropdown";

import TableCogIcon from "~/assets/table_cog.svg";
import { Checkbox } from "../Checkbox";
import { Label } from "../Label";

interface ExpandableChartPanelProps extends PropsWithChildren {
  id: string;
  className?: string;
  titleSlot: React.ReactNode;
  descriptionSlot: React.ReactNode;
  optionsSlot?: React.ReactNode;
}

export function ExpandableChartPanel(props: ExpandableChartPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("expand") === props.id;

  function handleClose() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("expand");

    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <>
      <ChartPanel {...props} isExpanded={false} />
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          if (!val) handleClose();
        }}
      >
        <DialogContent className={cn("bg-gray-800 p-0", props.className)}>
          <ChartPanel {...props} isExpanded={true} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChartPanel(props: ExpandableChartPanelProps & { isExpanded: boolean }) {
  return (
    <div className="p-5">
      <div
        className={cn(
          "mb-7 flex justify-between gap-x-5",
          props.isExpanded && "-mx-5 border-b border-gray-500 px-5 pb-4"
        )}
      >
        <div>
          <h3 className="text-base font-medium leading-7 text-white md:text-h3">{props.titleSlot}</h3>
          <p className="text-xs text-gray-200 md:text-body">{props.descriptionSlot}</p>
        </div>
        {!props.isExpanded && (
          <div>
            {props.optionsSlot && <span className={cn("px-5")}> {props.optionsSlot}</span>}
            <QueryLink query={{ expand: props.id }} scroll={false}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" iconButton className="!h-8">
                    <ExpandIcon className="h-4 w-4 text-gray-200" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expand</TooltipContent>
              </Tooltip>
            </QueryLink>
          </div>
        )}
      </div>
      {props.children}
    </div>
  );
}
