'use client'

import { PropsWithChildren } from "react";
import { Container } from "~/components/Container";
import { AccountTypeSelector } from "~/components/rates/AccountTypeSelector";
import { EfficiencyRatesNavigation } from "~/components/rates/EfficiencyRatesNavigation";
import { AccountAlgorithmProvider } from "~/hooks/useAccountAlgorithm";

export default function RatesLayout(props: PropsWithChildren) {
  return (
    <Container>
      <AccountAlgorithmProvider>
        <h1 className="pb-4 text-h1 font-bold">Efficiency Rates</h1>
        <div className="sticky top-0 bg-gray-900 pt-4">
          <EfficiencyRatesNavigation />
          <div className="mt-7 flex justify-end pb-7 sm:hidden">
            <AccountTypeSelector />
          </div>
        </div>
        {props.children}
      </AccountAlgorithmProvider>
    </Container>
  );
}
