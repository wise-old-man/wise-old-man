import Link from "next/link";
import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { CompetitionsFilters } from "~/components/competitions/CompetitionsFilters";

export default function CompetitionsLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <Container>
      <div className="mb-8 flex flex-col justify-between border-b border-gray-600 pb-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-h1 font-bold">Competitions</h1>
          <p className="mt-1 text-body text-gray-200">
            Consequat qui ea commodo amet quis qui pariatur cillum sint reprehenderit consequat id.
          </p>
        </div>
        <Link
          href="/competitions/create"
          className="mt-8 text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline lg:mt-0"
        >
          + Create new
        </Link>
      </div>
      <CompetitionsFilters />
      <div className="mt-6">{children}</div>
    </Container>
  );
}
