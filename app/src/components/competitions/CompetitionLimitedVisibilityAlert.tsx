import { Alert, AlertDescription, AlertTitle } from "../Alert";

export function CompetitionLimitedVisibilityAlert() {
  return (
    <Alert variant="warn">
      <div>
        <AlertTitle className="mb-0">This page has limited visibility</AlertTitle>
        <AlertDescription>
          <p>
            This competition has been hidden due to suspicious activity. Progress gained in it will still
            be tracked.{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wiseoldman.net/discord"
              className="text-white underline"
            >
              Contact us on Discord
            </a>
            {" for help."}
          </p>
        </AlertDescription>
      </div>
    </Alert>
  );
}
