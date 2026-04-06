import Link from "next/link";
import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { GroupsFilters } from "~/components/groups/GroupsFilters";

export default function GroupsLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <Container>
      <div className="mb-8 flex flex-col justify-between border-b border-gray-600 pb-6 lg:flex-row lg:items-end">
        <h1 className="text-h1 font-bold">Groups</h1>
        <Link
          prefetch={false}
          href="/groups/create"
          rel="nofollow"
          className="text-primary-400 hover:text-primary-300 mt-8 text-sm font-medium hover:underline lg:mt-0"
        >
          + Create new
        </Link>
      </div>
      <GroupsFilters />
      <div className="mt-6">{children}</div>
    </Container>
  );
}
