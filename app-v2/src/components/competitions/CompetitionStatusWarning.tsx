"use client";

import { Alert, AlertDescription } from "../Alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../Accordion";

const FAQ = {
  ending: [
    {
      question: "Why is this necessary?",
      answer: `In order to calculate any progress (gains) made within the competition, we need to track
      every player's start and end values, these have to be within the competition's
      boundaries. This means we need at least one data point at the after beginning on the
      competition, and at least one before the end.`,
    },
    {
      question: "Why can't WOM auto-update everyone before the competition ends?",
      answer: `Group updates aren't instant, so it would take some time for it to go through all the
      participants. If we auto-update everyone a few hours too early, we could miss some later
      gains. If we did it right before the competition ends, it could either not finish updating
      everyone in time, or prevent people from updating in last few minutes.`,
    },
  ],
  starting: [
    {
      question: "Why is this necessary?",
      answer: `In order to calculate any progress (gains) made within the competition, we need to track
      every player's start and end values, these have to be within the competition's
      boundaries. This means we need at least one data point at the after beginning on the
      competition, and at least one before the end.`,
    },
    {
      question: "Does WOM auto-update all participants when the competition begins?",
      answer: `WOM will try to auto-update everyone after the competition begins, up to 3 times per
      player, but it isn't guaranteed to work. (the hiscores could be experiencing
      difficulties). For this reason, we recommend that group/competition managers pay attention
      to any missing players and update them manually.`,
    },
  ],
};

interface CompetitionStatusWarningProps {
  status: "ending" | "starting";
}

export function CompetitionStatusWarning(props: CompetitionStatusWarningProps) {
  const { status } = props;

  return (
    <Alert className="border-yellow-600 bg-yellow-900/10">
      <AlertDescription>
        {status === "ending" ? (
          <>
            This competition is ending soon. This is a reminder that in order for gains to be correctly
            calculated, participants must be updated&nbsp;
            <span className="text-white">before the competition ends</span>.
          </>
        ) : (
          <>
            This competition is starting soon. This is a reminder that in order for gains to be correctly
            calculated, participants must be updated&nbsp;
            <span className="text-white">after the competition has started</span>, and then at least once
            again <span className="text-white">before it ends</span>.
          </>
        )}
      </AlertDescription>
      <Accordion className="mt-5" type="single" collapsible>
        <AccordionItem value="faq" className="border-0">
          <AccordionTrigger className="border border-gray-500 p-3 text-sm text-gray-100">
            F.A.Q
          </AccordionTrigger>
          <AccordionContent className="border border-t-0 border-gray-500 p-5 text-gray-200">
            {FAQ[status].map((faq) => (
              <div key={faq.question} className="mb-5 last:mb-0">
                <h4 className="mb-1 text-base font-medium text-white">{faq.question}</h4>
                <p className="text-sm">{faq.answer}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Alert>
  );
}
