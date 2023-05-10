import { Container } from "~/components/Container";

interface PageProps {
  params: {
    username: string;
  };
}

export default function PlayerPage(props: PageProps) {
  const username = decodeURI(props.params.username);

  return (
    <Container>
      <h1 className="text-h1 font-bold">{username}</h1>
      <p className="mt-2 text-body text-gray-100">The player page is still under construction.</p>
    </Container>
  );
}
