"use client";

import { PropsWithChildren } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "~/utils/styling";
import { Button } from "../Button";
import { QueryLink } from "../QueryLink";
import { Dialog, DialogContent } from "../Dialog";

import ExpandIcon from "~/assets/expand.svg";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

interface ExpandableChartPanelProps extends PropsWithChildren {
  id: string;
  className?: string;
  titleSlot: React.ReactNode;
  descriptionSlot: React.ReactNode;
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
      <ChartPanel {...props} showExpand={true} />
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          if (!val) handleClose();
        }}
      >
        <DialogContent className={cn("p-0", props.className)}>
          <ChartPanel {...props} showExpand={false} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChartPanel(props: ExpandableChartPanelProps & { showExpand: boolean }) {
  return (
    <div className="p-5">
      <div className="mb-7 flex justify-between">
        <div>
          <h3 className="text-h3 font-medium text-white">{props.titleSlot}</h3>
          <p className="text-body text-gray-200">{props.descriptionSlot}</p>
        </div>
        {props.showExpand && (
          <QueryLink query={{ expand: props.id }} scroll={false}>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="outline" iconButton className="!h-8">
                  <ExpandIcon className="h-4 w-4 text-gray-200" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Expand</TooltipContent>
            </Tooltip>
          </QueryLink>
        )}
      </div>
      {props.children}
    </div>
  );
}
