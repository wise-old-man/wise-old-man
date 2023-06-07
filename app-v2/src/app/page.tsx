import { Container } from "~/components/Container";

export default function Home() {
  return (
    <Container>
      <div className="mx-auto mt-20 flex min-h-[20rem] flex-col items-center text-center">
        <h2 className="max-w-sm text-h2 font-semibold">Welcome to the beta version of wiseoldman.net</h2>
        <p className="mt-3 text-body text-gray-200">
          🚧 It is still under construction, but any feedback is appreciated.
        </p>
      </div>
    </Container>
  );
}
