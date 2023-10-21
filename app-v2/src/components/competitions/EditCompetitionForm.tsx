"use client";

import { CompetitionDetails, CompetitionType } from "@wise-old-man/utils";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Container } from "../Container";
import { QueryLink } from "../QueryLink";
import { cn } from "~/utils/styling";
import { GroupVerificationCodeCheckDialog } from "../groups/GroupVerificationCodeCheckDialog";
import { CompetitionVerificationCodeCheckDialog } from "./CompetitionVerificationCodeCheckDialog";

interface EditCompetitionFormProps {
  competition: CompetitionDetails;
}

export function EditCompetitionForm(props: EditCompetitionFormProps) {
  const { competition } = props;

  const section = useSearchParams().get("section");
  const [verificationCode, setVerificationCode] = useState<string | undefined>();

  return (
    <Container className="max-w-4xl">
      <h1 className="mt-3 border-b border-gray-600 pb-7 text-3xl font-bold">{competition.title}</h1>

      <div className="grid grid-cols-10 gap-x-12">
        <div className="col-span-3 border-r border-gray-600 pr-7 pt-7">
          <SideNavigation type={competition.type} />
        </div>
        <div className="col-span-7 pt-7">
          {section === "teams" ? (
            <div>teams!</div>
          ) : (
            <>{section === "participants" ? <div>participants!</div> : <>general</>}</>
          )}
        </div>
      </div>

      {/* {competition.group ? (
        <GroupVerificationCodeCheckDialog
          group={competition.group}
          isOpen={!verificationCode}
          onValidated={setVerificationCode}
          isEditingGroupCompetition
        />
      ) : (
        <CompetitionVerificationCodeCheckDialog
          competition={competition}
          isOpen={!verificationCode}
          onValidated={setVerificationCode}
        />
      )} */}
    </Container>
  );
}

function SideNavigation(props: { type: CompetitionType }) {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  return (
    <ul>
      <QueryLink query={{ section: "general" }}>
        <li
          className={cn(
            "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
            (!section || section === "general") && "bg-gray-700 text-white"
          )}
        >
          {(!section || section === "general") && (
            <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />
          )}
          General
        </li>
      </QueryLink>
      {props.type === CompetitionType.CLASSIC ? (
        <QueryLink query={{ section: "participants" }}>
          <li
            className={cn(
              "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
              section === "participants" && "bg-gray-700 text-white"
            )}
          >
            {section === "participants" && (
              <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />
            )}
            Participants
          </li>
        </QueryLink>
      ) : (
        <QueryLink query={{ section: "teams" }}>
          <li
            className={cn(
              "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
              section === "teams" && "bg-gray-700 text-white"
            )}
          >
            {section === "teams" && <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />}
            Teams
          </li>
        </QueryLink>
      )}
    </ul>
  );
}
