import { notFound } from "next/navigation";
import {
  CompetitionDetails,
  MetricProps,
  ParticipationWithPlayerAndProgress,
  isActivity,
  isBoss,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { apiClient } from "~/utils/api";
import { timeago } from "~/utils/dates";
import { Button } from "~/components/Button";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableColumns,
  TableContainer,
  TableHeader,
  TableRow,
} from "~/components/Table";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function CompetitionPage(props: PageProps) {
  const { id } = props.params;

  const competition = await apiClient.competitions.getCompetitionDetails(id).catch((e) => {
    if (e instanceof Error && "statusCode" in e && e.statusCode === 404) {
      notFound();
    }
    throw e;
  });

  return (
    <TableContainer>
      <TableHeader>
        <div className="flex flex-col">
          <h3 className="text-h3 font-medium">Participants</h3>
          <p className="text-sm text-gray-200">
            Nisi ipsum aliqua velit labore culpa minim consectetur elit nulla.
          </p>
        </div>
        <Button>Export table</Button>
      </TableHeader>
      <Table>
        <TableColumns>
          <TableColumn>Rank</TableColumn>
          <TableColumn>Player</TableColumn>
          <TableColumn>Start</TableColumn>
          <TableColumn>End</TableColumn>
          <TableColumn>Gained</TableColumn>
          <TableColumn>Updated</TableColumn>
        </TableColumns>
        <TableBody>
          {competition.participations.map((p, index) => {
            const hasStartingValue = p.player.updatedAt && p.player.updatedAt >= competition.startsAt;

            return (
              <TableRow key={p.player.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <PlayerIdentity player={p.player} />
                </TableCell>
                <TableCell>
                  <ParticipantStartCell competition={competition} participant={p} />
                </TableCell>
                <TableCell>
                  <ParticipantEndCell competition={competition} participant={p} />
                </TableCell>
                <TableCell className={cn(p.progress.gained > 0 && "text-green-500")}>
                  {p.progress.gained > 0 ? "+" : ""}
                  <FormattedNumber value={p.progress.gained} />
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "flex items-center justify-between gap-x-3",
                      !hasStartingValue && "text-red-500"
                    )}
                  >
                    {p.player.updatedAt ? timeago.format(p.player.updatedAt) : "---"}
                    <Button size="sm">Update</Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface ParticipantStartCellProps {
  competition: CompetitionDetails;
  participant: ParticipationWithPlayerAndProgress;
}

function ParticipantStartCell(props: ParticipantStartCellProps) {
  const { competition, participant } = props;
  const { player, progress } = participant;

  const hasStartingValue = player.updatedAt && player.updatedAt >= competition.startsAt;

  if (!hasStartingValue) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>
          This player hasn&apos;t yet been updated since the competition started.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isBoss(competition.metric) && MetricProps[competition.metric].minimumValue > progress.start) {
    const { name, minimumValue } = MetricProps[competition.metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} kills at {minimumValue} kc.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isActivity(competition.metric) && MetricProps[competition.metric].minimumValue > progress.start) {
    const { name, minimumValue } = MetricProps[competition.metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} after {minimumValue}+ score.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (progress.start === -1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>
          This player is currently unranked in {MetricProps[competition.metric].name}.
        </TooltipContent>
      </Tooltip>
    );
  }

  return <FormattedNumber value={progress.start} />;
}

interface ParticipantEndCellProps {
  competition: CompetitionDetails;
  participant: ParticipationWithPlayerAndProgress;
}

function ParticipantEndCell(props: ParticipantEndCellProps) {
  const { competition, participant } = props;

  if (competition.startsAt > new Date()) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>This competition hasn&apos;t started yet.</TooltipContent>
      </Tooltip>
    );
  }

  const { player, progress } = participant;

  const hasStartingValue = player.updatedAt && player.updatedAt >= competition.startsAt;

  if (!hasStartingValue) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>
          This player hasn&apos;t yet been updated since the competition started.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isBoss(competition.metric) && MetricProps[competition.metric].minimumValue > progress.end) {
    const { name, minimumValue } = MetricProps[competition.metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} kills at {minimumValue} kc.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isActivity(competition.metric) && MetricProps[competition.metric].minimumValue > progress.end) {
    const { name, minimumValue } = MetricProps[competition.metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} after {minimumValue}+ score.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (progress.end === -1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>
          This player is currently unranked in {MetricProps[competition.metric].name}.
        </TooltipContent>
      </Tooltip>
    );
  }

  return <FormattedNumber value={progress.end} />;
}
