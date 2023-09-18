"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { EfficiencyAlgorithmType, Metric } from "@wise-old-man/utils";
import { getAlgorithmTypeParam } from "~/utils/params";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxTrigger,
} from "../Combobox";

import ChevronDownIcon from "~/assets/chevron_down.svg";

export function AccountTypeSelector() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const metric = pathname.includes("ehp") ? Metric.EHP : Metric.EHB;
  const type = getAlgorithmTypeParam(String(params.type)) || EfficiencyAlgorithmType.MAIN;

  function handleTypeChanged(value: string) {
    router.push(`/${metric}/${value}`);
  }

  function handlePrefetch() {
    // When the user opens the account type selector, we prefetch the other pages in advance,
    // so that by the time they choose an option, it'll be partially or fully loaded.
    Object.values(EfficiencyAlgorithmType).forEach((type) => {
      router.prefetch(`/${metric}/${type}`);
    });
  }

  return (
    <Combobox
      value={type}
      onValueChanged={(val) => {
        if (val && Object.values(EfficiencyAlgorithmType).includes(val as any)) {
          handleTypeChanged(val);
        }
      }}
      onOpenChange={(open) => {
        if (open) handlePrefetch();
      }}
    >
      <ComboboxTrigger className="flex items-center text-sm text-gray-200">
        Account type:
        <span className="ml-2 mr-1 inline-block font-medium text-white">{getLabel(type)}</span>
        <ChevronDownIcon className="h-5 w-5 text-white" />
      </ComboboxTrigger>
      <ComboboxContent align="end" sideOffset={8}>
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            {Object.values(EfficiencyAlgorithmType).map((t) => (
              <ComboboxItem key={t} value={t}>
                {getLabel(t)}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

function getLabel(type: EfficiencyAlgorithmType) {
  switch (type) {
    case EfficiencyAlgorithmType.MAIN:
      return "Main";
    case EfficiencyAlgorithmType.IRONMAN:
      return "Ironman";
    case EfficiencyAlgorithmType.ULTIMATE:
      return "Ultimate";
    case EfficiencyAlgorithmType.LVL3:
      return "Level 3";
    case EfficiencyAlgorithmType.F2P:
      return "F2P";
    case EfficiencyAlgorithmType.F2P_LVL3:
      return "F2P & Level 3";
    case EfficiencyAlgorithmType.F2P_IRONMAN:
      return "F2P & Ironman";
    default:
      return "Unknown";
  }
}
