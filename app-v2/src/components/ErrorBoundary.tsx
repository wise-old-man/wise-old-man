import { Button } from "./Button";

export function ErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-500 px-10 py-20">
      <h1 className="text-lg font-bold">An unexpected error has occurred</h1>
      <p className="mb-5 text-body text-gray-200">Please refresh the page to try again.</p>
      <Button size="sm" variant="blue" onClick={() => location.reload()}>
        Refresh
      </Button>
    </div>
  );
}
