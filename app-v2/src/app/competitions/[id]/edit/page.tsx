import { Container } from "~/components/Container";

interface PageProps {
  params: {
    id: number;
  };
}

export default function EditCompetitionPage(props: PageProps) {
  return (
    <Container>
      <h1 className="text-h1 font-bold">Edit Competition</h1>
      <p className="mt-3 text-body text-gray-200">
        🚧 This page hasn&apos;t been implemented yet. We recommend you to use the non-beta version of
        it.
      </p>
      <a
        href={`https://wiseoldman.net/competitions/${props.params.id}/edit`}
        className="mt-5 block text-sm text-blue-400 hover:underline"
      >
        Go to live version
      </a>
    </Container>
  );
}
