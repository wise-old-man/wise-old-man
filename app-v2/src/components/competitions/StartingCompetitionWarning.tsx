"use client";

import { Alert, AlertDescription } from "../Alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../Accordion";

export function StartingCompetitionWarning() {
  return (
    <Alert className="mb-10 bg-gray-900">
      <AlertDescription>
        Your competition is starting soon. This is a reminder that in order for gains to be correctly
        calculated, participants must be updated&nbsp;
        <span className="text-white">after the competition has started</span>, and then at least once
        again <span className="text-white">before it ends</span>.
      </AlertDescription>
      <Accordion className="mt-5" type="single" collapsible>
        <AccordionItem value="why" className="border-0">
          <AccordionTrigger className="border border-gray-500 p-3 text-sm text-gray-100">
            Why is this necessary?
          </AccordionTrigger>
          <AccordionContent className="border border-t-0 border-gray-500 p-3 text-gray-200">
            In order to calculate any progress (gains) made within the competition, we need to track
            every player&apos;s start and end values, these have to be within the competition&apos;s
            boundaries. This means we need at least one data point at the after beginning on the
            competition, and at least one before the end.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="auto" className="border-0">
          <AccordionTrigger className="border border-t-0 border-gray-500 p-3 text-sm text-gray-100">
            Does it auto-update when the competition begins?
          </AccordionTrigger>
          <AccordionContent className="border-x border-b border-gray-500 p-3 text-gray-200">
            WOM will try to auto-update everyone after the competition begins, up to 3 times per player,
            but it isn&apos;t guaranteed to work. (the hiscores could be experiencing difficulties). For
            this reason, we recommend that group/competition managers pay attention to any missing
            players and update them manually.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Alert>
  );
}
