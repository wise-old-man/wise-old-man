"use client";
import { Button } from "~/components/Button";
import { Label } from "~/components/Label";
import { Checkbox } from "~/components/Checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/Dropdown";
import TableCogIcon from "~/assets/table_cog.svg";
import { useRouter, useSearchParams } from "next/navigation";

export interface HeatmapOptionsMenuProps {
  excludeInitialLoad: boolean;
  username: string;
}
export function HeatmapOptionsMenu(props: HeatmapOptionsMenuProps) {
  const { excludeInitialLoad, username } = props;
  const searchParams = useSearchParams();
  const router = useRouter();
  function handleExcludeInitialLoadChanged(value: boolean) {
    const nextParams = new URLSearchParams(searchParams);

    if (value === true) {
      nextParams.set("excludeInitial", "true");
    } else {
      nextParams.delete("excludeInitial");
    }

    router.replace(`/players/${username}/gained?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button iconButton className="relative">
          <TableCogIcon className="h-5 w-5" />
          {excludeInitialLoad && (
            <div className="absolute -right-px -top-px h-2 w-2 rounded-full bg-blue-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent">
          <Checkbox
            id="virtual_levels"
            checked={excludeInitialLoad}
            onCheckedChange={(val) => handleExcludeInitialLoadChanged(Boolean(val))}
          />
          <Label htmlFor="virtual_levels" className="ml-2 block w-full">
            Exclude initial load
          </Label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
