import { Container } from "~/components/Container";
import { apiClient, getSailingData } from "~/services/wiseoldman";
import { SailingExpChart } from "./SailingExpChart";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { FormattedNumber } from "~/components/FormattedNumber";
import Link from "next/link";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";

import VerifiedIcon from "~/assets/verified.svg";
import { cn } from "~/utils/styling";
import { SailingExpBarChart } from "./SailingExpBarChart";
import { SailingCountChart } from "./SailingCountChart";
import { SailingCountBarChart } from "./SailingCountBarChart";
import { formatNumber, Metric, Period } from "@wise-old-man/utils";
import { PlayerIdentity } from "~/components/PlayerIdentity";

import WomCharacterImage from "../../../public/img/sailing_wom_pirate.png";
import BackgroundImage from "../../../public/img/sailing_port_sarim.webp";
import SailingTitle from "../../../public/img/sailing_title.svg";

// Invalidate the cached version of this page every 5 minutes
export const revalidate = 300;

export function generateMetadata() {
  return {
    title: `Sailing`,
  };
}

export default async function SailingPage() {
  const [sailingData, dayDeltas] = await Promise.all([
    getSailingData(),
    apiClient.deltas.getDeltaLeaderboard({
      metric: Metric.SAILING,
      period: Period.DAY,
    }),
  ]);

  return (
    <div>
      <div className="relative mb-16 h-[28rem] w-full bg-blue-900">
        <div className="bg-sailing-hero-gradient absolute inset-0 mx-auto max-w-[100vw]" />
        <Image src={BackgroundImage} fill alt="" className="absolute blur-[2px] inset-0 object-cover opacity-20" />
        <div className="z-1 absolute bottom-0 flex w-full justify-center">
          <Image src={WomCharacterImage} width={496} height={405} alt="" />
        </div>
        <div className="bg-sailing-hero-overlay-gradient z-2 absolute bottom-0 h-60 w-full" />
        <div className="z-5 absolute bottom-24 flex w-full justify-center">
          <SailingTitle />
        </div>
        <div className="absolute bottom-0 z-10 flex w-full translate-y-12 justify-center">
          <div className="relative flex flex-col items-center">
            <p className="rounded-2xl border border-gray-500 bg-gray-900 px-8 py-5 text-3xl font-bold text-white md:text-5xl">
              {formatNumber(sailingData.timeseries.at(-1)?.sum ?? 0)}
            </p>
            <p className="absolute -top-6 rounded-lg border border-gray-500 bg-gray-900 px-3 py-2 text-xs font-semibold uppercase text-gray-200">
              Estimated total exp.
            </p>
          </div>
        </div>
      </div>
      <Container className="flex flex-col gap-y-20">
        <div>
          <h1 className="text-h1 font-bold text-white">Global Stats</h1>
          <hr className="my-7 border-gray-500" />
          <h3 className="mt-3 text-h3 font-medium text-white">Estimated Sailing exp.</h3>
          <p className="mt-0.5 text-body text-gray-200">
            All the Sailing exp. on the Hiscores, aggregated over time.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="w-full">
              <SailingExpChart timeseries={sailingData.timeseries} />
            </div>
            <div className="w-full">
              <SailingExpBarChart timeseries={sailingData.timeseries} />
            </div>
            <div className="w-full">
              <SailingCountChart timeseries={sailingData.timeseries} />
            </div>
            <div className="w-full">
              <SailingCountBarChart timeseries={sailingData.timeseries} />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-h1 font-bold text-white">Other Stats</h1>
          <hr className="my-7 border-gray-500" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mt-3 text-h3 font-semibold text-white">Top groups</h3>
              <p className="mb-2 mt-0.5 text-body text-gray-200">Sorted by total Sailing exp.</p>
              <ListTable>
                {sailingData.top10Groups.slice(0, 5).map((row, index) => (
                  <ListTableRow key={row.group.id}>
                    <ListTableCell className="w-1 pr-1 text-xs text-gray-300">
                      #{index + 1}
                    </ListTableCell>
                    <ListTableCell>
                      <Link
                        prefetch={false}
                        href={`/groups/${row.group.id}`}
                        className="flex flex-row gap-x-3"
                      >
                        {row.group.profileImage && (
                          <Image
                            src={row.group.profileImage}
                            alt={`${row.group.name} - Profile Image`}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full border border-amber-300 bg-gray-800"
                          />
                        )}
                        <div
                          className="flex items-center gap-x-1.5 text-sm font-medium hover:underline"
                          style={{ minHeight: 32 }}
                        >
                          <span className={cn("line-clamp-1", row.group.patron && "text-amber-300")}>
                            {row.group.name}
                          </span>
                          {row.group.verified && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <VerifiedIcon className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                This group is verified on our Discord server.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </Link>
                    </ListTableCell>
                    <ListTableCell className="w-5 text-right font-medium">
                      <FormattedNumber value={row.sum} colored />
                    </ListTableCell>
                  </ListTableRow>
                ))}
              </ListTable>
            </div>
            <div>
              <h3 className="mt-3 text-h3 font-semibold text-white">Top players today</h3>
              <p className="mb-2 mt-0.5 text-body text-gray-200">
                Sorted by gained Sailing exp. in the past 24h
              </p>
              <ListTable>
                {dayDeltas.slice(0, 5).map((row, index) => (
                  <ListTableRow key={row.player.username}>
                    <ListTableCell className="w-1 pr-1 text-xs text-gray-300">
                      #{index + 1}
                    </ListTableCell>
                    <ListTableCell>
                      <PlayerIdentity
                        player={row.player}
                        href={`/players/${row.player.username}/gained?metric=sailing&period=day`}
                      />
                    </ListTableCell>
                    <ListTableCell className="w-5 text-right font-medium">
                      <FormattedNumber value={row.gained} colored />
                    </ListTableCell>
                  </ListTableRow>
                ))}
              </ListTable>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
