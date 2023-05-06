import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { NameChangeSubmissionDialog } from "~/components/names/NameChangeSubmissionDialog";
import { NameChangesFilters } from "~/components/names/NameChangesFilters";
import { NameChangesSubmitLink } from "~/components/names/NameChangesSubmitLink";

export default function NameChangesLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <Container>
      <div className="mb-8 flex flex-col justify-between border-b border-gray-600 pb-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-h1 font-bold">Name changes</h1>
          <p className="mt-1 text-body text-gray-200">
            Consequat qui ea commodo amet quis qui pariatur cillum sint reprehenderit consequat id.
          </p>
        </div>
        <NameChangesSubmitLink />
      </div>
      <NameChangesFilters />
      <div className="custom-scroll mt-6 overflow-x-auto">{children}</div>
      <NameChangeSubmissionDialog />
    </Container>
  );
}
