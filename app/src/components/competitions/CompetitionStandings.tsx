"use client";

import { CompetitionType } from "@wise-old-man/utils";
import { useCompetitionPageContext } from "./CompetitionPageContext";
import { NewParticipantsTable } from "./NewParticipantsTable";
import { NewTeamsTable } from "./NewTeamsTable";
import { useSearchParams } from "next/navigation";
import ArrowRightIcon from "~/assets/arrow_right.svg";
import { QueryLink } from "../QueryLink";

export function CompetitionStandings() {
  const { competition, selectedMetric } = useCompetitionPageContext();

  const searchParams = useSearchParams();

  if (competition.type !== CompetitionType.TEAM) {
    return <NewParticipantsTable />;
  }

  const selectedTeamParam = decodeURI(searchParams.get("team") ?? "");
  const uniqueTeamNames = new Set(competition.participations.map((p) => p.teamName));

  const selectedTeam =
    selectedTeamParam && uniqueTeamNames.has(selectedTeamParam) ? selectedTeamParam : null;

  if (selectedTeam === null) {
    return <NewTeamsTable />;
  }

  return (
    <div className="mb-0 rounded-lg border border-gray-400 bg-gray-700 pb-0">
      <QueryLink
        query={{ team: null }}
        className="flex items-center gap-x-1 p-3 text-gray-100 hover:text-white"
      >
        <ArrowRightIcon className="h-5 w-5 rotate-180" />
        <span className="text-sm">Back to teams</span>
      </QueryLink>
      <div className="-pb-1 -m-px">
        <NewParticipantsTable teamName={selectedTeam} />
      </div>
    </div>
  );
}
