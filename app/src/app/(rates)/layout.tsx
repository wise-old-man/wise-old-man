import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { Alert, AlertTitle, AlertDescription } from "~/components/Alert";
import { AccountTypeSelector } from "~/components/rates/AccountTypeSelector";
import { EfficiencyRatesNavigation } from "~/components/rates/EfficiencyRatesNavigation";

export default function RatesLayout(props: PropsWithChildren) {
  return (
    <Container>
      <h1 className="pb-4 text-h1 font-bold">Efficiency Rates</h1>
      <div className="sticky top-0 bg-gray-900 pt-4">
        <EfficiencyRatesNavigation />
        <div className="mt-7 flex justify-end pb-7 sm:hidden">
          <AccountTypeSelector />
        </div>
      </div>
      <Alert className="mt-7 pb-4" variant="warn">
        <AlertTitle>⚠️ &nbsp;Attention</AlertTitle>
        <AlertDescription>
          <p>
            Please keep in mind these are the main game efficiency rates and they have not been adapted
            for Leagues.
          </p>
        </AlertDescription>
      </Alert>
      {props.children}
    </Container>
  );
}
