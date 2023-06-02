import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { QueryLink } from "~/components/QueryLink";
import { NameChangesFilters } from "~/components/names/NameChangesFilters";
import { NameChangeSubmissionDialog } from "~/components/names/NameChangeSubmissionDialog";

export default function NameChangesLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <Container>
      <div className="mb-8 flex flex-col justify-between border-b border-gray-600 pb-6 lg:flex-row lg:items-end">
        <h1 className="text-h1 font-bold">Name changes</h1>
        <QueryLink
          query={{ dialog: "submit" }}
          prefetch={false}
          className="mt-8 text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline lg:mt-0"
        >
          + Submit new
        </QueryLink>
      </div>
      <NameChangesFilters />
      <div className="mt-6">{children}</div>
      <NameChangeSubmissionDialog />
    </Container>
  );
}
