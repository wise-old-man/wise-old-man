"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Metric, isMetric } from "@wise-old-man/utils";
import { Input } from "../Input";
import { Button } from "../Button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../Accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

import CheckIcon from "~/assets/check.svg";

interface ExportCompetitionDialogProps {
  competitionId: number;
}

function buildExportUrl(competitionId: number, preview?: Metric) {
  const params = new URLSearchParams();
  params.set("table", "participants"); // TODO: add other options when teams are added

  if (preview) params.set("metric", preview);

  return `https://api.wiseoldman.net/v2/competitions/${competitionId}/csv?${params.toString()}`;
}

export function ExportCompetitionDialog(props: ExportCompetitionDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hasCopied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = searchParams.get("dialog") === "export";

  const preview = searchParams.get("preview");
  const isValidMetric = !!preview && isMetric(preview);

  const url = buildExportUrl(props.competitionId, isValidMetric ? preview : undefined);
  const importFormula = `=IMPORTDATA("${url}")`;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) {
          router.back();
          setCopied(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export competition table</DialogTitle>
          <DialogDescription>
            You can import this competition&apos;s data into a Google Sheets document by using the
            following function:
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="mb-7 flex items-center gap-x-2">
            <Input
              ref={inputRef}
              readOnly
              autoFocus={false}
              value={importFormula}
              containerClassName="grow"
              className="font-mono text-blue-300"
            />
            <Button
              autoFocus
              variant={hasCopied ? "default" : "blue"}
              onClick={() => {
                if (inputRef.current) inputRef.current.select();
                navigator.clipboard.writeText(importFormula);
                setCopied(true);
              }}
            >
              {hasCopied && <CheckIcon className="-ml-2 h-4 w-4 text-green-500" />}
              {hasCopied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="update_frequency" className="border-0">
              <AccordionTrigger className="rounded border border-gray-500 p-3 text-sm text-gray-100">
                How often will it be updated?
              </AccordionTrigger>
              <AccordionContent className="mt-1 rounded border border-gray-500 p-3 text-gray-200">
                Google Sheets automatically updates their synced sheets at up to 1 hour intervals.
                <a
                  href="https://support.google.com/area120-tables/answer/9904107?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-white hover:underline"
                >
                  [source]
                </a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
