import { Container } from "~/components/Container";
import { getSailingData } from "~/services/wiseoldman";
import { SailingTimeseriesChart } from "./SailingTimeseriesChart";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { FormattedNumber } from "~/components/FormattedNumber";
import Link from "next/link";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";

import VerifiedIcon from "~/assets/verified.svg";
import { cn } from "~/utils/styling";

export function generateMetadata() {
  return {
    title: `Sailing`,
  };
}

export default async function SailingPage() {
  const data = await getSailingData();

  return (
    <Container className="flex flex-col gap-y-6">
      <h1>Total exp: {data.timeseries.at(-1)?.sum ?? 0}</h1>
      <div className="max-w-lg">
        <SailingTimeseriesChart timeseries={data.timeseries} />
      </div>
      <div className="max-w-sm">
        <h2>Top 10 (Verified) Groups</h2>
        <ListTable>
          {data.top10Groups.map((row, index) => (
            <ListTableRow key={row.group.id}>
              <ListTableCell className="w-1 pr-1">{index + 1}</ListTableCell>
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
                  <div className="flex items-center gap-x-1.5 text-sm font-medium hover:underline">
                    <span className={cn("line-clamp-1", row.group.patron && "text-amber-300")}>
                      {row.group.name}
                    </span>
                    {row.group.verified && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <VerifiedIcon className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>This group is verified on our Discord server.</TooltipContent>
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
    </Container>
  );
}
