import { Suspense } from "react";
import { CreateGroupForm } from "~/components/groups/CreateGroupForm";

export const metadata = {
  title: "Create a new group",
};

export default function CreateGroupPage() {
  return (
    <Suspense>
      <CreateGroupForm />
    </Suspense>
  );
}
