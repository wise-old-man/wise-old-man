import LoadingIcon from "~/assets/loading.svg";

export default function Loading() {
  return (
    <div className="mt-7 flex h-[24rem] items-center justify-center rounded-lg border border-gray-600 bg-gray-800">
      <LoadingIcon className="h-10 w-10 animate-spin text-gray-300" />
    </div>
  );
}
