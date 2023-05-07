import Link from "next/link";
import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";

export default function RatesLayout(props: PropsWithChildren) {
  const { children } = props;

  // @ts-ignore - There's no decent API from Next.js yet (as of 13.3.0)
  const routeSegment = children.props.childProp.segment;

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-h1 font-bold">Efficiency Rates</h1>
        <p className="mt-1 text-body text-gray-200">
          Consequat qui ea commodo amet quis qui pariatur cillum sint reprehenderit consequat id.
        </p>
      </div>
      <Tabs defaultValue={routeSegment}>
        <TabsList>
          <Link href="/ehp">
            <TabsTrigger value="ehp">EHP Rates</TabsTrigger>
          </Link>
          <Link href="/ehb">
            <TabsTrigger value="ehb">EHB Rates</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      {children}
    </Container>
  );
}
