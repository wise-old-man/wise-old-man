import { Badge } from "./Badge";
import { Button } from "./Button";

interface ErrorStateProps {
  tag?: string;
  error: Error;
}

export function ErrorState(props: ErrorStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-lg border border-gray-500 px-10 py-20">
      <h1 className="text-lg font-bold">An unexpected error has occurred</h1>
      <p className="mb-5 text-body text-gray-200">Please refresh the page to try again.</p>
      <Button size="sm" variant="blue" onClick={() => location.reload()}>
        Refresh
      </Button>
      {process.env.NODE_ENV === "development" && (
        <>
          {props.tag && (
            <Badge variant="error" className="absolute right-4 top-4">
              {props.tag}
            </Badge>
          )}
          <code className="mt-10 rounded-lg bg-red-900/40 p-5 text-sm">{String(props.error)}</code>
        </>
      )}
    </div>
  );
}
