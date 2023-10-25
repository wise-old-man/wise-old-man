import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { LeaderboardsFilters } from "~/components/leaderboards/LeaderboardsFilters";
import { LeaderboardsNavigation } from "~/components/leaderboards/LeaderboardsNavigation";

export default function LeaderboardsLayout(props: PropsWithChildren) {
  return (
    <Container>
      <h1 className="mb-8 text-h1 font-bold">Leaderboards</h1>
      <LeaderboardsNavigation />
      <LeaderboardsFilters />
      <div className="mx-auto mt-10 grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {props.children}
      </div>
    </Container>
  );
}
