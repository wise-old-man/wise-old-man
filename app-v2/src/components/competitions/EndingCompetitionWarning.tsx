"use client";

import { Alert, AlertDescription } from "../Alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../Accordion";

export function EndingCompetitionWarning() {
  return (
    <Alert className="mb-10 bg-gray-900">
      <AlertDescription>
        Your competition is ending soon. This is a reminder that in order for gains to be correctly
        calculated, participants must be updated&nbsp;
        <span className="text-white">before the competition ends</span>.
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
            Why can&apos; WOM auto-update everyone before the competition ends?
          </AccordionTrigger>
          <AccordionContent className="border-x border-b border-gray-500 p-3 text-gray-200">
            Group updates aren&apos;t instant, so it would take some time for it to complete. If we did
            it a few hours early, it could mean we end up
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Alert>
  );
}
