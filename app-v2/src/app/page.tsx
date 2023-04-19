import { Button } from "~/components/Button";
import PlusIcon from "~/assets/plus.svg";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-7 p-20">
      <div className="flex gap-x-4">
        <Button variant="blue">
          Update
          <PlusIcon className="-mr-2 h-5 w-5" />
        </Button>
        <Button>
          <PlusIcon className="-ml-2 h-5 w-5" />
          Cancel
        </Button>
      </div>
      <div className="flex gap-x-4">
        <Button size="sm" variant="blue">
          Update
        </Button>
        <Button size="sm">Cancel</Button>
      </div>
    </div>
  );
}
