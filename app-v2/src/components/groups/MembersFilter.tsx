"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxItemsContainer,
  ComboboxItemGroup,
  ComboboxItem,
} from "../Combobox";
import { useTransition } from "react";

const FILTERS = [
  { value: "all", dropdownLabel: "All members", buttonLabel: "All members" },
  {
    value: "invalid_or_outdated",
    dropdownLabel: "Invalid / outdated members",
    buttonLabel: "Invalid / outdated",
  },
  {
    value: "inactive_7_days",
    dropdownLabel: "Last progressed > 7 days",
    buttonLabel: "Inactive > 7 days",
  },
  {
    value: "inactive_30_days",
    dropdownLabel: "Last progressed > 30 days",
    buttonLabel: "Inactive > 30 days",
  },
  {
    value: "inactive_90_days",
    dropdownLabel: "Last progressed > 90 days",
    buttonLabel: "Inactive > 90 days",
  },
];

interface MembersFilterProps {
  groupId: number;
  filter?: string;
}

export function MembersFilter(props: MembersFilterProps) {
  const { groupId } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  function handleFilterChanged(filter: string | undefined) {
    const nextParams = new URLSearchParams(searchParams);

    if (filter && filter.length > 0) {
      nextParams.set("filter", filter);
    } else {
      nextParams.delete("filter");
    }

    startTransition(() => {
      router.replace(`/groups/${groupId}?${nextParams.toString()}`);
    });
  }

  // if url filter isn't valid, fallback to "all"
  const filter = FILTERS.find((f) => f.value === props.filter)?.value || FILTERS[0].value;

  return (
    <Combobox
      value={filter}
      onValueChanged={(val) => handleFilterChanged(val === "all" ? undefined : val)}
    >
      <ComboboxButton className="w-full bg-gray-800 sm:w-48" isPending={isPending}>
        <div className="flex items-center gap-x-2">
          {FILTERS.find((f) => f.value === filter)?.buttonLabel || FILTERS[0].buttonLabel}
        </div>
      </ComboboxButton>
      <ComboboxContent className="w-[16rem]" align="end">
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Status">
            {FILTERS.map((f) => (
              <ComboboxItem value={f.value} key={f.value}>
                {f.dropdownLabel}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
