import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";
import LoadingIcon from "~/assets/loading.svg";

export default function Loading() {
  return (
    <div>
      <ToggleTabs value="hiscores">
        <ToggleTabsList>
          <ToggleTabsTrigger value="hiscores">Hiscores</ToggleTabsTrigger>
          <ToggleTabsTrigger value="gained">Gained</ToggleTabsTrigger>
          <ToggleTabsTrigger value="records">Records</ToggleTabsTrigger>
        </ToggleTabsList>
      </ToggleTabs>
      <div className="mt-10 flex h-[20rem] items-center justify-center rounded-lg border border-gray-600">
        <LoadingIcon className="h-6 w-6 animate-spin text-gray-300" />
      </div>
    </div>
  );
}
