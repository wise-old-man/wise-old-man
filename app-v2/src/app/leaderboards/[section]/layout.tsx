import Link from "next/link";
import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { LeaderboardsFilters } from "./components/LeaderboardsFilters";

interface LeaderboardsLayoutProps extends PropsWithChildren {
  params: {
    section?: string;
  };
}

export default function LeaderboardsLayout(props: LeaderboardsLayoutProps) {
  const { params, children } = props;
  const { section } = params;

  return (
    <Container>
      <h1 className="mb-8 text-h1 font-bold">Leaderboards</h1>
      <Tabs defaultValue={section}>
        <TabsList>
          <Link href="/leaderboards/top">
            <TabsTrigger value="top">Current Top</TabsTrigger>
          </Link>
          <Link href="/leaderboards/records">
            <TabsTrigger value="records">Records</TabsTrigger>
          </Link>
          <Link href="/leaderboards/efficiency">
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <LeaderboardsFilters />
      </div>
      <div className="mx-auto mt-10 grid max-w-md grid-cols-1 gap-x-4 gap-y-8 lg:max-w-none lg:grid-cols-3">
        {children}
      </div>
    </Container>
  );
}
