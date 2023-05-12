import Link from "next/link";
import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { AccountTypeSelector } from "~/components/rates/AccountTypeSelector";

export default function RatesLayout(props: PropsWithChildren) {
  const { children } = props;

  // @ts-ignore - There's no decent API from Next.js yet (as of 13.4.0)
  const routeSegment = children.props.childProp.segment;

  return (
    <Container>
      <div>
        <h1 className="text-h1 font-bold">Efficiency Rates</h1>
        <p className="mt-1 text-body text-gray-200">
          Consequat qui ea commodo amet quis qui pariatur cillum sint reprehenderit consequat id.
        </p>
      </div>
      <div className="sticky top-16 bg-gray-900 pt-8">
        <Tabs defaultValue={routeSegment}>
          <TabsList
            aria-label="Efficiency Rates Navigation"
            rightElementSlot={
              <div className="hidden sm:block">
                <AccountTypeSelector />
              </div>
            }
          >
            <Link href="/ehp" aria-label="Navigate to EHP rates">
              <TabsTrigger value="ehp">EHP Rates</TabsTrigger>
            </Link>
            <Link href="/ehb" aria-label="Navigate to EHB rates">
              <TabsTrigger value="ehb">EHB Rates</TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
        <div className="mt-7 flex justify-end pb-7 sm:hidden">
          <AccountTypeSelector />
        </div>
      </div>
      {children}
    </Container>
  );
}
