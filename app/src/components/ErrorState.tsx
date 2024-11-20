import { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cn } from "~/utils/styling";

interface ErrorStateProps {
  tag?: string;
  error: Error;
}

export function ErrorState(props: ErrorStateProps) {
  const [devMode, setDevMode] = useState(process.env.NODE_ENV === "development");

  return (
    <div className="relative flex flex-col items-center justify-center rounded-lg border border-gray-500 px-10 py-20">
      <h1 className="text-lg font-bold">An unexpected error has occurred</h1>
      <p className="mb-5 text-body text-gray-200">Please refresh the page to try again.</p>
      <Button size="sm" variant="primary" onClick={() => location.reload()}>
        Refresh
      </Button>

      {props.tag && (
        <button
          onClick={() => setDevMode(!devMode)}
          className={cn(devMode ? "opacity-100" : "opacity-0")}
        >
          <Badge variant="error" className="absolute right-4 top-4">
            {props.tag}
          </Badge>
        </button>
      )}

      {devMode && (
        <code className="mt-10 rounded-lg bg-red-900/40 p-5 text-sm">{String(props.error)}</code>
      )}
    </div>
  );
}
