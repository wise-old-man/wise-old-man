import { Suspense } from "react";
import { CreateGroupForm } from "~/components/groups/CreateGroupForm";
import LoadingIcon from "~/assets/loading.svg";

export const metadata = {
  title: "Create a new group",
};

export default function CreateGroupPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[72rem]">
          <div className="flex h-80 items-center justify-center">
            <LoadingIcon className="h-10 w-10 animate-spin text-gray-200" />
          </div>
        </div>
      }
    >
      <CreateGroupForm />
    </Suspense>
  );
}
